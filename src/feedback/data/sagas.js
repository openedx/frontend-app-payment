import { put } from 'redux-saga/effects';

import { addMessage } from './actions';
import { MESSAGE_TYPES } from './constants';

export function* handleErrors(e) {
  // If this doesn't contain anything we understand, bail.
  if (e.errors === undefined && e.fieldErrors === undefined && e.messages === undefined) {
    throw e;
  }
  if (e.errors !== undefined) {
    for (let i = 0; i < e.errors.length; i++) { // eslint-disable-line no-plusplus
      const error = e.errors[i];
      yield put(addMessage(error.code, error.userMessage, null, error.messageType));
    }
  }
  if (e.messages !== undefined) {
    for (let i = 0; i < e.messages.length; i++) { // eslint-disable-line no-plusplus
      const message = e.messages[i];
      yield put(addMessage(message.code, message.userMessage, null, message.messageType));
    }
  }
  if (e.fieldErrors !== undefined) {
    for (let i = 0; i < e.fieldErrors.length; i++) { // eslint-disable-line no-plusplus
      const fieldError = e.fieldErrors[i];
      yield put(addMessage(
        fieldError.code,
        fieldError.userMessage,
        null,
        MESSAGE_TYPES.ERROR,
        fieldError.fieldName,
      ));
    }
  }
}

export function* handleMessages(messages) {
  // If this doesn't contain anything we understand, bail.
  if (!Array.isArray(messages)) {
    return null;
  }

  for (let i = 0; i < messages.length; i++) { // eslint-disable-line no-plusplus
    const message = messages[i];
    yield put(addMessage(message.code, message.userMessage, null, message.messageType));
  }
  return null;
}
