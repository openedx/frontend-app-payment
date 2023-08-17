import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import { sendSubscriptionEvent, handleCustomErrors } from './utils'; // Replace with the correct path to the file containing the functions.

// Mock the sendTrackEvent function from '@edx/frontend-platform/analytics' for testing
jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

describe('sendSubscriptionEvent', () => {
  let details = null;
  beforeEach(() => {
    jest.clearAllMocks();
    details = {
      paymentMethod: 'Stripe',
      isTrialEligible: false,
      isNewSubscription: false,
      programUuid: '12345',
      price: 79,
    };
  });

  it('should call sendTrackEvent with success eventType', () => {
    const success = true;

    sendSubscriptionEvent({ details, success });

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.user.subscription.program.checkout.success', {
      paymentProcessor: 'Stripe',
      isTrialEligible: false,
      isNewSubscription: false,
      programUuid: '12345',
      price: 79,
    });
  });

  it('should call sendTrackEvent with failure eventType', () => {
    const success = false;

    sendSubscriptionEvent({
      details: {
        ...details,
        isTrialEligible: true,
        isNewSubscription: true,
      },
      success,
    });

    expect(sendTrackEvent).toHaveBeenCalledTimes(1);
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.user.subscription.program.checkout.failure', {
      paymentProcessor: 'Stripe',
      isTrialEligible: true,
      isNewSubscription: true,
      programUuid: '12345',
      price: 79,
    });
  });
});

describe('handleCustomErrors', () => {
  it('should return an error object with the provided error code and message', () => {
    const error = {
      cause: 'SOME_ERROR_CODE',
      message: 'Some error message',
    };
    const fallbackKey = null;

    const result = handleCustomErrors(error, fallbackKey);

    expect(result).toBeInstanceOf(Error);
    expect(result.errors).toEqual([{ code: 'SOME_ERROR_CODE', userMessage: 'Some error message' }]);
  });

  it('should return an error object with the fallback error code and message if fallbackKey is provided', () => {
    const error = {
      cause: 'SOME_ERROR_CODE',
      message: 'Some error message',
    };
    const fallbackKey = 'FALLBACK_ERROR_CODE';

    const result = handleCustomErrors(error, fallbackKey);

    expect(result).toBeInstanceOf(Error);
    expect(result.errors).toEqual([{ code: 'FALLBACK_ERROR_CODE', userMessage: 'Some error message' }]);
  });
});
