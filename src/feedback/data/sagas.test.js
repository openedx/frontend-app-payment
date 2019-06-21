import { runSaga } from 'redux-saga';
import handleErrors from './sagas';
import { DANGER } from './constants';
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
        message: 'Uhoh oh no!',
      },
      {
        code: 'oh_goodness',
        message: 'This is really bad!',
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
      addMessage('uhoh', 'Uhoh oh no!', null, DANGER),
      addMessage('oh_goodness', 'This is really bad!', null, DANGER),
    ]);
  });

  it('should dispatch addMessage actions on field errors', async () => {
    error.fieldErrors = [
      {
        code: 'uhoh',
        message: 'Uhoh oh no!',
        fieldName: 'field1',
      },
      {
        code: 'oh_goodness',
        message: 'This is really bad!',
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
      addMessage('uhoh', 'Uhoh oh no!', null, DANGER, 'field1'),
      addMessage('oh_goodness', 'This is really bad!', null, DANGER, 'field2'),
    ]);
  });

  it('should dispatch addMessage actions on a mix of error types', async () => {
    error.errors = [
      {
        code: 'uhoh',
        message: 'Uhoh oh no!',
      },
    ];
    error.fieldErrors = [
      {
        code: 'oh_goodness',
        message: 'This is really bad!',
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
      addMessage('uhoh', 'Uhoh oh no!', null, DANGER),
      addMessage('oh_goodness', 'This is really bad!', null, DANGER, 'field2'),
    ]);
  });
});
