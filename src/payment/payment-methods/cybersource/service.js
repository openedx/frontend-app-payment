import formurlencoded from 'form-urlencoded';
import pick from 'lodash.pick';
import { logApiClientError } from '@edx/frontend-logging';

import { applyConfiguration, handleRequestError } from '../../../common/serviceUtils';
import { generateAndSubmitForm } from '../../../common/utils';

let config = {
  CYBERSOURCE_URL: null,
  ECOMMERCE_BASE_URL: null,
  ENVIRONMENT: null,
};

let apiClient = null; // eslint-disable-line no-unused-vars

export function configureApiService(newConfig, newApiClient) {
  applyConfiguration(config, newConfig);
  config = pick(newConfig, Object.keys(config));
  apiClient = newApiClient;
}

/**
 * SDN: Specially Designated Nationals And Blocked Persons List.
 * This check ensures that by making a transaction with this user
 * we do not violate US sanctions. If this request returns with
 * 'hits' then we must not perform the transaction.
 */
export async function sdnCheck(basketId, firstName, lastName, city, country) {
  const { data } = await apiClient.post(
    `${config.ECOMMERCE_BASE_URL}/api/v2/sdn/search/`,
    {
      name: `${firstName} ${lastName}`,
      city,
      country,
    },
  ).catch((error) => {
    logApiClientError(error, {
      messagePrefix: 'SDN Check Error',
      paymentMethod: 'Cybersource',
      paymentErrorType: 'SDN Check',
      basketId,
    });

    throw error;
  });

  return data;
}

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
    for (let i = 0; i < fieldKeys.length; i++) { // eslint-disable-line no-plusplus
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

  const sdnCheckResponse = await sdnCheck(
    basketId,
    cardHolderInfo.firstName,
    cardHolderInfo.lastName,
    cardHolderInfo.city,
    cardHolderInfo.country,
  );

  if (sdnCheckResponse.hits > 0) {
    /* istanbul ignore next */
    if (config.ENVIRONMENT !== 'test') {
      global.location.href = `${config.ECOMMERCE_BASE_URL}/payment/sdn/failure/`;
    }
    throw new Error('This card holder did not pass the SDN check.');
  }

  const { data } = await apiClient.post(
    `${config.ECOMMERCE_BASE_URL}/payment/cybersource/api-submit/`,
    formurlencoded({
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
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  ).catch((error) => {
    logApiClientError(error, {
      messagePrefix: 'Cybersource Submit Error',
      paymentMethod: 'Cybersource',
      paymentErrorType: 'Submit Error',
      basketId,
    });

    if (error.response && error.response.data) {
      // This endpoint does not return field error data in a format we expect.  Fix it.
      error.response.data = { // eslint-disable-line no-param-reassign
        field_errors: normalizeFieldErrors(error.response.data.field_errors),
      };

      handleApiError(error);
    }

    throw error;
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
    card_number: cardNumber,
    card_type: cardTypeId,
    card_cvn: securityCode,
    card_expiry_date: [cardExpirationMonth.padStart(2, '0'), cardExpirationYear].join('-'),
  };

  generateAndSubmitForm(config.CYBERSOURCE_URL, cybersourcePaymentParams);
}
