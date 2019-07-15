import { runSaga } from 'redux-saga';
import { handleErrors } from './sagas';
import { MESSAGE_TYPES } from './constants';
import { addMessage } from './actions';

describe('saga tests', () => {
  let dispatched;
  let caughtErrors;
  let error;
  beforeEach(() => {
    dispatched = [];
    caughtErrors = [];
    error = new Error();
  });

  it('should throw on unexpected errors', async () => {
    try {
      await runSaga(
        {
          dispatch: action => dispatched.push(action),
          onError: err => caughtErrors.push(err),
        },
        handleErrors,
        error,
      ).toPromise();
    } catch (e) {} // eslint-disable-line no-empty
    expect(caughtErrors).toEqual([error]);
  });

  it('should dispatch addMessage actions on API errors', async () => {
    error.errors = [
      {
        code: 'uhoh',
        userMessage: 'Uhoh oh no!',
        messageType: MESSAGE_TYPES.ERROR,
      },
      {
        code: 'oh_goodness',
        userMessage: 'This is really bad!',
        messageType: MESSAGE_TYPES.ERROR,
      },
    ];
    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      handleErrors,
      error,
    ).toPromise();

    expect(dispatched).toEqual([
      addMessage('uhoh', 'Uhoh oh no!', undefined, MESSAGE_TYPES.ERROR),
      addMessage('oh_goodness', 'This is really bad!', undefined, MESSAGE_TYPES.ERROR),
    ]);
  });

  it('should dispatch addMessage actions on API messages', async () => {
    error.messages = [
      {
        code: 'uhoh',
        userMessage: 'Uhoh oh no!',
        messageType: MESSAGE_TYPES.INFO,
      },
      {
        code: 'oh_goodness',
        userMessage: 'This is really bad!',
        messageType: MESSAGE_TYPES.ERROR,
      },
    ];
    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      handleErrors,
      error,
    ).toPromise();

    expect(dispatched).toEqual([
      addMessage('uhoh', 'Uhoh oh no!', undefined, MESSAGE_TYPES.INFO),
      addMessage('oh_goodness', 'This is really bad!', undefined, MESSAGE_TYPES.ERROR),
    ]);
  });

  it('should dispatch addMessage actions on field errors', async () => {
    error.fieldErrors = [
      {
        code: 'uhoh',
        userMessage: 'Uhoh oh no!',
        fieldName: 'field1',
      },
      {
        code: 'oh_goodness',
        userMessage: 'This is really bad!',
        fieldName: 'field2',
      },
    ];
    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      handleErrors,
      error,
    ).toPromise();

    expect(dispatched).toEqual([
      addMessage('uhoh', 'Uhoh oh no!', undefined, MESSAGE_TYPES.ERROR, 'field1'),
      addMessage('oh_goodness', 'This is really bad!', undefined, MESSAGE_TYPES.ERROR, 'field2'),
    ]);
  });

  it('should dispatch addMessage actions on a mix of error types', async () => {
    error.errors = [
      {
        code: 'uhoh',
        userMessage: 'Uhoh oh no!',
        messageType: MESSAGE_TYPES.ERROR,
      },
    ];
    error.fieldErrors = [
      {
        code: 'oh_goodness',
        userMessage: 'This is really bad!',
        fieldName: 'field2',
      },
    ];
    await runSaga(
      {
        dispatch: action => dispatched.push(action),
      },
      handleErrors,
      error,
    ).toPromise();

    expect(dispatched).toEqual([
      addMessage('uhoh', 'Uhoh oh no!', undefined, MESSAGE_TYPES.ERROR),
      addMessage('oh_goodness', 'This is really bad!', undefined, MESSAGE_TYPES.ERROR, 'field2'),
    ]);
  });
});
