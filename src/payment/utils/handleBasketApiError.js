import { handleRequestError } from '../../common/serviceUtils';
import { transformResults } from '../data/service';

export default function (requestError) {
  try {
    // Always throws an error:
    handleRequestError(requestError);
  } catch (errorWithMessages) {
    const processedError = new Error();
    processedError.messages = errorWithMessages.messages;
    processedError.errors = errorWithMessages.errors;
    processedError.fieldErrors = errorWithMessages.fieldErrors;

    if (requestError.response.data) {
      processedError.basket = transformResults(requestError.response.data);
    }

    throw processedError;
  }
}
