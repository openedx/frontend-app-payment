import pick from 'lodash.pick';

export function applyConfiguration(expected, actual) {
  Object.keys(expected).forEach((key) => {
    if (actual[key] === undefined) {
      throw new Error(`Service configuration error: ${key} is required.`);
    }
  });
  return pick(actual, Object.keys(expected));
}

/**
 * Turns field errors of the form:
 *
 * {
 *   "name":{
 *     "developer_message": "Nerdy message here",
 *     "user_message": "This value is invalid."
 *   },
 *   "other_field": {
 *     "developer_message": "Other Nerdy message here",
 *     "user_message": "This other value is invalid."
 *   }
 * }
 *
 * Into:
 *
 * {
 *   "name": "This value is invalid.",
 *   "other_field": "This other value is invalid"
 * }
 */
export function unpackFieldErrors(fieldErrors) {
  return Object.entries(fieldErrors).reduce((acc, [k, v]) => {
    acc[k] = v.user_message;
    return acc;
  }, {});
}

function handleFieldErrors(errors) {
  const fieldErrors = Object.entries(errors).map(([name, value]) => ({
    code: value.error_code ? value.error_code : null,
    message: value.user_message,
    fieldName: name,
  }));

  const validationError = new Error();
  validationError.fieldErrors = fieldErrors;
  throw validationError;
}

function handleApiErrors(errors) {
  const apiErrors = errors.map(err => ({
    code: err.error_code ? err.error_code : null,
    message: err.user_message ? err.user_message : null,
  }));

  const apiError = new Error();
  apiError.errors = apiErrors;
  throw apiError;
}

/**
 * Processes and re-throws request errors.  If the response contains a field_errors field, will
 * massage the data into a form expected by the client.
 *
 * If the response contains a single API error, will similarly format that for the client.
 *
 * Field errors will be packaged with a fieldErrors field usable by the client.
 * Takes an optional unpack function which is used to process the field errors,
 * otherwise uses the default unpackFieldErrors function.
 *
 * @param error The original error object.
 * @param unpackFunction (Optional) A function to use to unpack the field errors as a replacement
 * for the default.
 */
export function handleRequestError(error) {
  // Validation errors
  if (error.response && error.response.data.field_errors) {
    handleFieldErrors(error.response.data.field_errors);
  }

  // API errors
  if (error.response && error.response.data.errors !== undefined) {
    handleApiErrors(error.response.data.errors);
  }

  // Single API error
  if (error.response && error.response.data.error_code) {
    handleApiErrors([
      {
        error_code: error.response.data.error_code,
        user_message: error.response.data.user_message,
      },
    ]);
  }

  // Other errors
  throw error;
}
