import { runSaga } from 'redux-saga';
import { Factory } from 'rosie';

import { camelCaseObject } from '../../../payment/data/utils';
// Actions
import { subscriptionStatusReceived } from './actions';
// Sagas
import { clearMessages, addMessage, MESSAGE_TYPES } from '../../../feedback';
import { handleSuccessful3DS } from './sagas';
// Services
import * as SubscriptionApiService from '../service';

import { sendSubscriptionEvent, handleCustomErrors } from '../utils';
import '../../__factories__/subscription.factory';
import '../../__factories__/subscriptionStatus.factory';

// Mocking service
jest.mock('../service', () => ({
  checkoutComplete: jest.fn(),
}));

// Mock the logError function
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

// // Mock the logError function
jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

// Mock the utils
jest.mock('../utils', () => ({
  sendSubscriptionEvent: jest.fn(),
  handleCustomErrors: jest.fn(),
}));

describe('status saga', () => {
  const payload = { /* your payload data */ };
  const details = camelCaseObject(Factory.build('subscription', { is_trial_eligible: true, status: 'succeeded' }, { numProducts: 2 }));
  const status = camelCaseObject(Factory.build('subscriptionStatus'));
  let dispatched;
  let fakeStore;
  beforeEach(() => {
    dispatched = [];
    SubscriptionApiService.checkoutComplete.mockReset();
    sendSubscriptionEvent.mockReset();
    // Used to reset the dispatch and onError handlers for runSaga.
    fakeStore = {
      getState: () => ({
        subscription: {
          details,
          status,
        },
      }),
      dispatch: action => dispatched.push(action),
    };
  });

  it('should handle successful 3DS flow', async () => {
    const apiResult = { status: 'succeeded' };
    // Mock the checkoutComplete function
    SubscriptionApiService.checkoutComplete.mockResolvedValue(apiResult);

    await runSaga(
      fakeStore,
      handleSuccessful3DS,
      payload,
    ).done;
    expect(dispatched).toEqual([
      clearMessages(),
      subscriptionStatusReceived(apiResult),
    ]);
    expect(SubscriptionApiService.checkoutComplete.mock.calls.length).toBe(1);
  });

  it('should handle unSuccessful 3DS flow', async () => {
    const errorApiResult = { status: 'requires_payment_method' };
    // Mocking the resolve value
    SubscriptionApiService.checkoutComplete.mockResolvedValue(errorApiResult);

    const err = new Error();
    err.errors = [{
      code: 'requires_payment_method',
      userMessage: 'Could not complete the purchase.',
    }];

    handleCustomErrors.mockResolvedValue(err);

    await runSaga(
      fakeStore,
      handleSuccessful3DS,
      payload,
    ).done;
    expect(dispatched).toEqual([
      clearMessages(),
      subscriptionStatusReceived(errorApiResult),
      clearMessages(),
      addMessage('fallback-error', null, {}, MESSAGE_TYPES.ERROR),
    ]);
    expect(SubscriptionApiService.checkoutComplete.mock.calls.length).toBe(1);
    expect(sendSubscriptionEvent.mock.calls.length).toBe(1);
    // Send error event
    expect(sendSubscriptionEvent.mock.calls[0][0]).toStrictEqual({ details, success: false });
  });
});
