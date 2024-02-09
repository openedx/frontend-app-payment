import { logError, logInfo } from '@edx/frontend-platform/logging';
import { camelCaseObject } from './utils';

function handleFieldErrors(errors) {
  const fieldErrors = Object.entries(errors).map(([name, value]) => ({
    code: value.error_code ? value.error_code : null,
    userMessage: value.user_message,
    fieldName: name,
  }));

  const validationError = new Error();
  validationError.fieldErrors = fieldErrors;
  throw validationError;
}

function handleApiErrors(errors) {
  const apiErrors = errors.map(err => ({
    code: err.error_code ? err.error_code : null,
    userMessage: err.user_message ? err.user_message : null,
    messageType: err.message_type ? err.message_type : null,
  }));

  const apiError = new Error();
  apiError.errors = apiErrors;
  throw apiError;
}

function handleApiMessages(messages) {
  const apiError = new Error();
  apiError.messages = camelCaseObject(messages);
  throw apiError;
}

/**
 * Processes and re-throws request errors.  If the response contains a field_errors field, will
 * massage the data into a form expected by the client.
 *
 * If the response contains a single API error, will similarly format that for the client.
 *
 * Field errors will be packaged with a fieldErrors field usable by the client.
 *
 * @param error The original error object.
 * @param unpackFunction (Optional) A function to use to unpack the field errors as a replacement
 * for the default.
 */
export default function handleRequestError(error) {
  // Validation errors
  if (error.response && error.response.data.field_errors) {
    logInfo('Field Errors', error.response.data.field_errors);
    handleFieldErrors(error.response.data.field_errors);
  }

  // API errors
  if (error.response && error.response.data.errors !== undefined) {
    logInfo('API Errors', error.response.data.errors);
    handleApiErrors(error.response.data.errors);
  }

  // API messages
  if (error.response && error.response.data.messages !== undefined) {
    logInfo('API Messages', error.response.data.messages);
    handleApiMessages(error.response.data.messages);
  }

  // Single API error
  if (error.response && error.response.data.error_code) {
    logInfo('API Error', error.response.data.error_code);
    handleApiErrors([
      {
        error_code: error.response.data.error_code,
        user_message: error.response.data.user_message,
      },
    ]);
  }

  // SKU mismatch error
  if (error.response && error.response.data.sku_error) {
    logInfo('SKU Error', error.response.data.sku_error);
    handleApiErrors([
      {
        error_code: 'basket-changed-error-message',
        user_message: 'error',
      },
    ]);
  }

  // Basket already purchased
  if (error.code === 'payment_intent_unexpected_state' && error.type === 'invalid_request_error') {
    logInfo('Basket Changed Error', error.code);
    handleApiErrors([
      {
        error_code: 'basket-changed-error-message',
        // TEMP TODO: Now that we have different Payment Intent statuses, this type of error can mean different things
        // Which message did it say when the basket was already purchased?
        // error_code: 'payment-intent-unexpected-state',
        user_message: 'error',
      },
    ]);
  }

  // Other errors
  logError(error);
  throw error;
}

// Processes API errors and converts them to error objects the sagas can use.
export function handleApiError(requestError) {
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
