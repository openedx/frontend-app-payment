import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  getDetails,
  postDetails,
  handleDetailsApiError,
  transformSubscriptionDetails,
} from './service';

const axiosMock = new MockAdapter(axios);

jest.mock('axios');

// Mock the getAuthenticatedHttpClient function
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

// Mock the getConfig function
jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({
    SUBSCRIPTIONS_BASE_URL: process.env.SUBSCRIPTIONS_BASE_URL,
  })),
  ensureConfig: jest.fn(),
}));

getAuthenticatedHttpClient.mockReturnValue(axios);

beforeEach(() => {
  axiosMock.reset();
});

const errorJSON = {
  code: 'invalid_card_details',
  user_message: 'Invalid Card Details.',
};

describe('getDetails', () => {
  const subscriptionDetails = {
    price: '79.00',
    total_price: '79.00',
    program_title: 'Blockchain Fundamentals',
    is_eligible_trial: true,
    payment_processor: 'stripe',
    currency: 'usd',
  };
  test('should return transformed data on success', async () => {
    axios.get.mockResolvedValue({
      data: subscriptionDetails,
    });

    const result = await getDetails();

    expect(result).toEqual({
      price: 79,
      totalPrice: 79,
      programTitle: 'Blockchain Fundamentals',
      isEligibleTrial: true,
      paymentProcessor: 'stripe',
      currency: 'usd',
    });
    expect(axios.get).toHaveBeenCalledWith(`${getConfig().SUBSCRIPTIONS_BASE_URL}/api/v1/stripe-checkout/`);
  });

  test('should throw an error on API failure', async () => {
    const error = new Error();
    error.errors = [errorJSON];
    axios.get.mockRejectedValue({
      data: {
        response: errorJSON,
      },
    });
    // jest.spyOn(axios, 'get').mockRejectedValue(error);
    await expect(getDetails()).rejects.toEqual(error);
    // await expect(getDetails()).rejects.toThrow(error);
    expect(axios.get).toHaveBeenCalledWith(`${getConfig().SUBSCRIPTIONS_BASE_URL}/api/v1/stripe-checkout/`);
  });
});

describe('postDetails', () => {
  const payload = {
    programTitle: 'Blockchain Fundamentals',
    programUuid: 'program-uuid',
    paymentMethodId: 'pm-payment-method',
    billingDetails: { address: '123 street address' },
  };
  const subscriptionSuccessStatus = {
    confirmation_status: 'succeeded',
    subscription_id: 'subscription-id',
    price: 79,
    total_price: 79,
  };

  test('should return transformed data on success', async () => {
    axios.post.mockResolvedValue({
      data: subscriptionSuccessStatus,
    });

    const result = await postDetails(payload);

    expect(result).toEqual({
      subscriptionId: 'subscription-id',
      confirmationStatus: 'succeeded',
      price: 79,
      totalPrice: 79,
    });
    expect(axios.post).toHaveBeenCalledWith(`${getConfig().SUBSCRIPTIONS_BASE_URL}/api/v1/stripe-checkout/`, payload);
  });

  test('should throw an error on API failure', async () => {
    const error = new Error();
    error.errors = [errorJSON];
    axios.post.mockRejectedValue({
      data: {
        response: errorJSON,
      },
    });
    await expect(postDetails(payload)).rejects.toEqual(error);
    expect(axios.post).toHaveBeenCalledWith(`${getConfig().SUBSCRIPTIONS_BASE_URL}/api/v1/stripe-checkout/`, payload);
  });
});

describe('handleDetailsApiError', () => {
  test('should throw an error with API errors', () => {
    const requestError = {
      response: {
        data: {
          error_code: 'SOME_ERROR',
          user_message: 'Some error occurred',
        },
      },
    };

    expect(() => {
      handleDetailsApiError(requestError);
    }).toThrow(Error);

    try {
      handleDetailsApiError(requestError);
    } catch (error) {
      expect(error.errors).toEqual([
        {
          code: 'SOME_ERROR',
          userMessage: 'Some error occurred',
        },
      ]);
    }
  });

  test('should throw an error without API errors', () => {
    const requestError = {};

    expect(() => {
      handleDetailsApiError(requestError);
    }).toThrow(Error);

    try {
      handleDetailsApiError(requestError);
    } catch (error) {
      expect(error.errors).toEqual([]);
    }
  });
});

describe('transformSubscriptionDetails', () => {
  test('should transform and parse price values', () => {
    const data = {
      price: '9.99',
      total_price: '19.00',
    };

    const transformedData = transformSubscriptionDetails(data);

    expect(transformedData).toEqual({
      price: 9.99,
      totalPrice: 19,
    });
  });
});
