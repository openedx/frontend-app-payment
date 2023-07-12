import { all } from 'redux-saga/effects';
import rootSaga from './sagas';
import { saga as subscriptionSaga } from '../subscription';
import { saga as paymentSaga } from '../payment';

describe('rootSaga', () => {
  it('should contain the correct sagas', () => {
    const gen = rootSaga();

    expect(gen.next().value).toEqual(all([
      paymentSaga(),
      subscriptionSaga(),
    ]));

    expect(gen.next().value).toBeUndefined();
  });
});
