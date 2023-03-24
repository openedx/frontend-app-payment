import { createStore, combineReducers } from 'redux';

import { reducer } from '../reducers';
import {
  clientSecretDataReceived,
  clientSecretProcessing,
} from './actions';
import { clientSecretSelector } from './selectors';

jest.mock('universal-cookie', () => {
  class MockCookies {
    static result = {};

    get() {
      return MockCookies.result;
    }
  }
  return MockCookies;
});

describe('subscription clientSecret redux tests', () => {
  let store;

  beforeEach(() => {
    store = createStore(combineReducers({
      subscription: reducer,
    }));
  });

  describe('selectors', () => {
    // describe('details', () => {
    it('default state', () => {
      const result = clientSecretSelector(store.getState());
      expect(result).toEqual({
        isClientSecretProcessing: false,
        clientSecretId: '',
      });
    });
  });

  describe('clientSecret reducer', () => {
    it('should return the default state when appropriate', () => {
      // Its base state
      expect(store.getState().subscription.clientSecret).toMatchSnapshot();

      // If an action isn't appropriate for it
      store.dispatch({ type: 'SOMETHING_ELSE' });
      expect(store.getState().subscription.clientSecret).toMatchSnapshot();

      // When called with no parameters
      expect(reducer()).toMatchSnapshot();
    });

    it('SUBSCRIPTION_CLIENT_SECRET_DATA_RECEIVED action', () => {
      store.dispatch(clientSecretDataReceived({ capture_context: { key_id: 'bar' } }));
      expect(store.getState().subscription.clientSecret.clientSecretId).toBe('bar');
    });

    describe('SUBSCRIPTION_CLIENT_SECRET_PROCESSING action', () => {
      it('SUBSCRIPTION_CLIENT_SECRET_PROCESSING true action', () => {
        store.dispatch(clientSecretProcessing(true));
        expect(store.getState().subscription.clientSecret.isClientSecretProcessing).toBe(true);
      });

      it('SUBSCRIPTION_CLIENT_SECRET_PROCESSING false action', () => {
        store.dispatch(clientSecretProcessing(false));
        expect(store.getState().subscription.clientSecret.isClientSecretProcessing).toBe(false);
      });
    });
  });
});
