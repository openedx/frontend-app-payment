import { runSaga } from 'redux-saga';
import { Factory } from 'rosie';

import { camelCaseObject } from '../../../payment/data/utils';

// Actions
import {
  subscriptionDetailsReceived,
  subscriptionDetailsProcessing,
  fetchSubscriptionDetails,
  submitSubscription,
} from './actions';

// Sagas
import { clearMessages, addMessage, MESSAGE_TYPES } from '../../../feedback';
import {
  handleFetchSubscriptionDetails,
  handleSubmitSubscription,
} from './sagas';

import { subscriptionDetailsInitialState } from './reducer';
import { subscriptionStatusReceived } from '../status/actions';

// Services
import * as SubscriptionApiService from '../service';
import { subscriptionStripeCheckout } from '../../subscription-methods';

import { sendSubscriptionEvent } from '../utils';

import '../../__factories__/subscription.factory';
import '../../__factories__/subscriptionStatus.factory';

// Mocking service
jest.mock('../service', () => ({
  getDetails: jest.fn(),
  postDetails: jest.fn(),
}));

// Mocking stripe service
jest.mock('../../subscription-methods', () => ({
  subscriptionStripeCheckout: jest.fn(),
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

describe('details saga', () => {
  const details = camelCaseObject(Factory.build('subscription', { is_trial_eligible: true, status: 'succeeded' }, { numProducts: 2 }));
  const status = camelCaseObject(Factory.build('subscriptionStatus'));
  let dispatched;
  let fakeStore;
  beforeEach(() => {
    dispatched = [];
    SubscriptionApiService.getDetails.mockReset();
    SubscriptionApiService.postDetails.mockReset();
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

  it('should successfully handleFetchSubscriptionDetails', async () => {
    // Mock the getDetails function
    SubscriptionApiService.getDetails.mockResolvedValue(details);

    await runSaga(
      {
        ...fakeStore,
        getState: () => ({
          subscription: {
            details: subscriptionDetailsInitialState,
            status,
          },
        }),
      },
      handleFetchSubscriptionDetails,
      {},
    ).done;
    expect(dispatched).toEqual([
      // clearMessages(),
      subscriptionDetailsProcessing(true),
      subscriptionDetailsReceived(details),
      subscriptionDetailsProcessing(false),
      fetchSubscriptionDetails.fulfill(),
      // subscriptionStatusReceived(details),
    ]);
    expect(SubscriptionApiService.getDetails.mock.calls.length).toBe(1);
  });

  it('should handle handleFetchSubscriptionDetails errors', async () => {
    // Mock the getDetails error state
    SubscriptionApiService.getDetails.mockRejectedValue(new Error('Api error'));

    await runSaga(
      {
        ...fakeStore,
        getState: () => ({
          subscription: {
            details: subscriptionDetailsInitialState,
            status,
          },
        }),
      },
      handleFetchSubscriptionDetails,
      {},
    ).done;
    expect(dispatched).toEqual([
      subscriptionDetailsProcessing(true),
      clearMessages(),
      addMessage('fallback-error', null, {}, MESSAGE_TYPES.ERROR),
      subscriptionDetailsProcessing(false),
      fetchSubscriptionDetails.fulfill(),
    ]);
    expect(SubscriptionApiService.getDetails.mock.calls.length).toBe(1);
  });

  it('should successfully post subscription details', async () => {
    const formData = { // dummy form data
      address: 'some dummy address',
      firstName: 'John',
      lastName: 'Smith',
      country: 'US',
    };

    const postData = { // saga payload data
      payload: {
        method: 'stripe',
        ...formData,
      },
    };

    const stripeServiceResult = { // stripe service result
      payment_method_id: status.paymentMethodId,
      program_uuid: details.programUuid,
      program_title: details.programTitle,
      billing_details: formData,
    };

    const result = { // api result
      status: 'succeeded',
      subscriptionId: status.subscriptionId,
    };

    // Mocking the resolve value
    subscriptionStripeCheckout.mockResolvedValue(stripeServiceResult);
    SubscriptionApiService.postDetails.mockResolvedValue(result);

    await runSaga(
      fakeStore,
      handleSubmitSubscription,
      postData,
    ).toPromise();
    expect(dispatched).toEqual([
      subscriptionDetailsProcessing(true),
      clearMessages(),
      submitSubscription.request(),
      submitSubscription.success(result),
      subscriptionStatusReceived({
        ...result,
        paymentMethodId: stripeServiceResult.payment_method_id,
      }),
      subscriptionDetailsProcessing(false),
    ]);
    expect(SubscriptionApiService.postDetails.mock.calls.length).toBe(1);
    expect(sendSubscriptionEvent.mock.calls.length).toBe(1);

    // send successful event
    expect(sendSubscriptionEvent.mock.calls[0][0]).toStrictEqual({ details, success: true });
  });
});
