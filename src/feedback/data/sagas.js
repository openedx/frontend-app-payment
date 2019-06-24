import { put } from 'redux-saga/effects';

import { addMessage } from './actions';
import { DANGER } from './constants';

export default function* handleErrors(e) {
  // If this doesn't contain anything we understand, bail.
  if (e.errors === undefined && e.fieldErrors === undefined) {
    throw e;
  }
  if (e.errors !== undefined) {
    for (let i = 0; i < e.errors.length; i++) { // eslint-disable-line no-plusplus
      const error = e.errors[i];
      yield put(addMessage(error.code, error.message, null, DANGER));
    }
  }
  if (e.fieldErrors !== undefined) {
    for (let i = 0; i < e.fieldErrors.length; i++) { // eslint-disable-line no-plusplus
      const fieldError = e.fieldErrors[i];
      yield put(addMessage(
        fieldError.code,
        fieldError.message,
        null,
        DANGER,
        fieldError.fieldName,
      ));
    }
  }
}
