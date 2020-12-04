import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import formurlencoded from 'form-urlencoded';
import { logError } from '@edx/frontend-platform/logging';

import handleRequestError from '../../data/handleRequestError';

import { CARD_ICONS } from '../../checkout/payment-form/utils/credit-card';

ensureConfig(['CYBERSOURCE_URL', 'ECOMMERCE_BASE_URL', 'ENVIRONMENT'], 'CyberSource API service');

/**
 * Converts a field_errors object of this form:
 *
 * { "field_name": "Error message.", "other_field_name": "Other error message." }
 *
 * To:
 *
 * {
 *   "field_name": { user_message: "Error message.", error_code: null },
 *   "other_field_name": { user_message: "Other error message.", error_code: null }
 * }
 */
export function normalizeFieldErrors(fieldErrors) {
  if (fieldErrors && !Array.isArray(fieldErrors) && typeof fieldErrors === 'object') {
    const normalizedErrors = {};
    const fieldKeys = Object.keys(fieldErrors);
    for (let i = 0; i < fieldKeys.length; i++) {
      // eslint-disable-line no-plusplus
      const fieldKey = fieldKeys[i];
      const userMessage = fieldErrors[fieldKey];
      normalizedErrors[fieldKey] = {
        user_message: userMessage,
        error_code: null,
      };
    }
    return normalizedErrors;
  }
  // Return it unchanged if it isn't an object.
  return fieldErrors;
}

// Processes API errors and converts them to error objects the sagas can use.
function handleApiError(requestError) {
  try {
    // Always throws an error:
    handleRequestError(requestError);
  } catch (errorWithMessages) {
    const processedError = new Error();
    processedError.messages = errorWithMessages.messages;
    processedError.errors = errorWithMessages.errors;
    processedError.fieldErrors = errorWithMessages.fieldErrors;

    throw processedError;
  }
}

function getPaymentToken(microformOptions) {
  return new Promise((resolve, reject) => {
    if (!window.microform) {
      reject(Error('Microform not initialized'));
    }
    window.microform.createToken(
      {
        expirationMonth: microformOptions.cardExpirationMonth.padStart(2, '0'),
        expirationYear: microformOptions.cardExpirationYear,
      }, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      },
    );
  });
}

function composeFieldError(reason, errors) {
  const microformMessageMap = {
    cardType: {
      fieldName: 'cardNumber',
      userMessage: 'payment.form.errors.unsupported.card',
    },
    number: {
      fieldName: 'cardNumber',
      userMessage: 'payment.form.errors.invalid.card.number',
    },
    securityCode: {
      fieldName: 'securityCode',
      userMessage: 'payment.form.errors.invalid.security.code',
    },
  };

  const fieldError = new Error(reason);
  fieldError.fieldErrors = [];
  errors.forEach((errorEntry) => {
    fieldError.fieldErrors.push({
      code: null,
      data: null,
      ...microformMessageMap[errorEntry],
    });
  });
  return fieldError;
}

export async function checkoutWithToken(
  basket,
  { cardHolderInfo, cardDetails },
  setLocation = href => { global.location.href = href; }, // HACK: allow tests to mock setting location
) {
  if (!window.microform) {
    throw new Error('Microform not initialized');
  }

  const { valid, cybsCardType } = window.microform.fields.number;
  if (!valid) {
    throw composeFieldError('Cybersource microform field validation failed', ['number']);
  }
  // HACK: card icons dict is keyed by the numeric card type, moving to card name would be better
  if (cybsCardType && !(CARD_ICONS[cybsCardType])) {
    throw composeFieldError('Cybersource microform field validation failed', ['cardType']);
  }

  const paymentToken = await getPaymentToken(cardDetails).catch((error) => {
    if (error.reason !== 'CREATE_TOKEN_VALIDATION_FIELDS') {
      throw error;
    }
    throw composeFieldError(
      'Cybersource Token Creation field validation failed',
      Array.from(error.details, ({ location }) => location),
    );
  });

  const { basketId } = basket;
  const formData = {
    basket: basketId,
    first_name: cardHolderInfo.firstName,
    last_name: cardHolderInfo.lastName,
    address_line1: cardHolderInfo.address,
    address_line2: cardHolderInfo.unit,
    city: cardHolderInfo.city,
    country: cardHolderInfo.country,
    state: cardHolderInfo.state,
    postal_code: cardHolderInfo.postalCode,
    organization: cardHolderInfo.organization,
    purchased_for_organization: cardHolderInfo.purchasedForOrganization,
    payment_token: paymentToken,
  };
  if (basket.discountJwt) {
    formData.discount_jwt = basket.discountJwt;
  }
  const { data } = await getAuthenticatedHttpClient()
    .post(`${getConfig().ECOMMERCE_BASE_URL}/payment/cybersource/authorize/`, formurlencoded(formData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .catch((error) => {
      const errorData = error.response ? error.response.data : null;
      if (errorData && error.response.data.sdn_check_failure) {
        /* istanbul ignore next */
        if (getConfig().ENVIRONMENT !== 'test') {
          setLocation(`${getConfig().ECOMMERCE_BASE_URL}/payment/sdn/failure/`);
        }
        logError(error, {
          messagePrefix: 'SDN Check Error',
          paymentMethod: 'Cybersource',
          paymentErrorType: 'SDN Check Submit Api',
          basketId,
        });
        throw new Error('This card holder did not pass the SDN check.');
      } else if (errorData && errorData.redirectTo) {
        // This was an expected issue and the back-end is requesting a redirect.
        // We use this when the payment has been declined.
        setLocation(errorData.redirectTo);
      } else if (errorData && errorData.field_errors) {
        // It's a field error
        // This endpoint does not return field error data in a format we expect.  Fix it.
        error.response.data = { // eslint-disable-line no-param-reassign
          field_errors: normalizeFieldErrors(error.response.data.field_errors),
        };
        handleApiError(error);
        throw error;
      } else {
        logError(error, {
          messagePrefix: 'Cybersource Submit Error',
          paymentMethod: 'Cybersource',
          paymentErrorType: 'Submit Error',
          basketId,
        });
        handleApiError(error);
        throw error;
      }
    });

  setLocation(data.receipt_page_url);
}
