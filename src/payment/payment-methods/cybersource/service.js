import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import formurlencoded from 'form-urlencoded';
import { logError } from '@edx/frontend-platform/logging';

import handleRequestError from '../../data/handleRequestError';
import { generateAndSubmitForm } from '../../data/utils';

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

// Strips spaces, hyphens, and any non-digit from a cardNumber
function getCardNumberDigits(cardNumber) {
  const numberPattern = /\d+/g;
  const cardNumberDigitArray = cardNumber.match(numberPattern) || [];
  return cardNumberDigitArray.join('');
}

function getPaymentToken(microformOptions) {
  return new Promise((resolve, reject) => {
    if (!window.microform) {
      reject(Error('Microform not initialized'));
    }
    window.microform.createToken(microformOptions, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

export async function checkoutWithToken(basket, { cardHolderInfo, cardDetails }) {
  const { basketId } = basket;

  const paymentToken = await getPaymentToken(cardDetails).catch((error) => {
    if (error.reason !== 'CREATE_TOKEN_VALIDATION_FIELDS') {
      throw error;
    }
    const microformFieldMap = {
      number: 'cardNumber',
      securityCode: 'securityCode',
    };
    const microformMessageMap = {
      number: 'payment.form.errors.invalid.card.number',
      securityCode: 'payment.form.errors.invalid.security.code',
    };
    const fieldError = new Error('Cybersource Token Creation field validation failed');
    fieldError.fieldErrors = [];
    error.details.forEach((errorEntry) => {
      fieldError.fieldErrors.push({
        code: null,
        data: null,
        userMessage: microformMessageMap[errorEntry.location],
        fieldName: microformFieldMap[errorEntry.location],
      });
    });
    throw fieldError;
  });
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
          global.location.href = `${getConfig().ECOMMERCE_BASE_URL}/payment/sdn/failure/`;
        }
        logError(error, {
          messagePrefix: 'SDN Check Error',
          paymentMethod: 'Cybersource',
          paymentErrorType: 'SDN Check Submit Api',
          basketId,
        });
        throw new Error('This card holder did not pass the SDN check.');
      } else {
        logError(error, {
          messagePrefix: 'Cybersource Submit Error',
          paymentMethod: 'Cybersource',
          paymentErrorType: 'Submit Error',
          basketId,
        });
        if (errorData && errorData.field_errors) {
          // It's a field error
          // This endpoint does not return field error data in a format we expect.  Fix it.
          error.response.data = { // eslint-disable-line no-param-reassign
            field_errors: normalizeFieldErrors(error.response.data.field_errors),
          };
        }
        handleApiError(error);
        throw error;
      }
    });

  global.location.href = data.receipt_page_url;
}

/**
 * Checkout with Cybersource.
 *
 * 1. Use card holder info to ensure we can make a transaction with this user
 * 2. Submit card holder data to our ecommerce /cybersource/api-submit/ endpoint.
 *    we must not send any payment information in this request.
 * 3. Generate a form and submit all data to CYBERSOURCE_URL. The user will
 *    then be redirected appropriately.
 */
export async function checkout(basket, { cardHolderInfo, cardDetails }) {
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
  };
  if (basket.discountJwt) {
    formData.discount_jwt = basket.discountJwt;
  }
  const { data } = await getAuthenticatedHttpClient()
    .post(`${getConfig().ECOMMERCE_BASE_URL}/payment/cybersource/api-submit/`, formurlencoded(formData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .catch((error) => {
      const errorData = error.response ? error.response.data : null;
      if (errorData && error.response.data.sdn_check_failure) {
        /* istanbul ignore next */
        if (getConfig().ENVIRONMENT !== 'test') {
          global.location.href = `${getConfig().ECOMMERCE_BASE_URL}/payment/sdn/failure/`;
        }
        logError(error, {
          messagePrefix: 'SDN Check Error',
          paymentMethod: 'Cybersource',
          paymentErrorType: 'SDN Check Submit Api',
          basketId,
        });
        throw new Error('This card holder did not pass the SDN check.');
      } else {
        logError(error, {
          messagePrefix: 'Cybersource Submit Error',
          paymentMethod: 'Cybersource',
          paymentErrorType: 'Submit Error',
          basketId,
        });
        if (errorData) {
          // It's a field error
          // This endpoint does not return field error data in a format we expect.  Fix it.
          error.response.data = { // eslint-disable-line no-param-reassign
            field_errors: normalizeFieldErrors(error.response.data.field_errors),
          };
          handleApiError(error);
        }
        throw error;
      }
    });

  const {
    cardNumber,
    cardTypeId,
    securityCode,
    cardExpirationMonth,
    cardExpirationYear,
  } = cardDetails;

  const cybersourcePaymentParams = {
    ...data.form_fields,
    card_number: getCardNumberDigits(cardNumber),
    card_type: cardTypeId,
    card_cvn: securityCode,
    card_expiry_date: [cardExpirationMonth.padStart(2, '0'), cardExpirationYear].join('-'),
  };
  if (basket.discountJwt) {
    cybersourcePaymentParams.discount_jwt = basket.discountJwt;
  }

  generateAndSubmitForm(getConfig().CYBERSOURCE_URL, cybersourcePaymentParams);
}
