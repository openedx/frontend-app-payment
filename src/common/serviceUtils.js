import pick from 'lodash.pick';
import { logApiClientError, logInfo } from '@edx/frontend-logging';
import { camelCaseObject } from './utils';


export function applyConfiguration(expected, actual) {
  Object.keys(expected).forEach((key) => {
    if (actual[key] === undefined) {
      throw new Error(`Service configuration error: ${key} is required.`);
    }
  });
  return pick(actual, Object.keys(expected));
}

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
export function handleRequestError(error) {
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
    logInfo('API Error', error.response.data.errors);
    handleApiErrors([
      {
        error_code: error.response.data.error_code,
        user_message: error.response.data.user_message,
      },
    ]);
  }

  // Other errors
  logApiClientError(error);
  throw error;
}
