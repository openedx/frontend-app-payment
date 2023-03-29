import { createRoutine } from 'redux-saga-routines';

// Created with redux-saga-routines
export const fetchSubscriptionClientSecret = createRoutine('FETCH_SUBSCRIPTION_CLIENT_SECRET');

export const SUBSCRIPTION_CLIENT_SECRET_PROCESSING = 'SUBSCRIPTION_CLIENT_SECRET_PROCESSING';
export const SUBSCRIPTION_CLIENT_SECRET_DATA_RECEIVED = 'SUBSCRIPTION_CLIENT_SECRET_DATA_RECEIVED';

export const clientSecretProcessing = isProcessing => ({
  type: SUBSCRIPTION_CLIENT_SECRET_PROCESSING,
  payload: isProcessing,
});

export const clientSecretDataReceived = clientSecret => ({
  type: SUBSCRIPTION_CLIENT_SECRET_DATA_RECEIVED,
  // TODO: refactor this to get the clientSecretID when fetching from subs BE
  payload: clientSecret && clientSecret.capture_context ? clientSecret.capture_context.key_id : null,
});
