import { createRoutine } from 'redux-saga-routines';

// Routines are action + action creator pairs in a series.
// Actions adhere to the flux standard action format.
// Routines by default are in the form of:
//
// Action                |   Action Creator
// -----------------------------------------------
// fetchSubscriptionDetails.TRIGGER   |   fetchSubscriptionDetails()
// fetchSubscriptionDetails.SUCCESS   |   fetchSubscriptionDetails.success()
// fetchSubscriptionDetails.FAILURE   |   fetchSubscriptionDetails.failure()
// fetchSubscriptionDetails.FULFILL   |   fetchSubscriptionDetails.fulfill()
//
// Created with redux-saga-routines
export const submitSubscription = createRoutine('SUBMIT_SUBSCRIPTION');
export const fetchSubscriptionDetails = createRoutine('FETCH_SUBSCRIPTION_DETAILS');

// Actions and their action creators
export const SUBSCRIPTION_DETAILS_RECEIVED = 'SUBSCRIPTION_DETAILS_RECEIVED';
export const SUBSCRIPTION_DETAILS_PROCESSING = 'SUBSCRIPTION_DETAILS_PROCESSING';

export const subscriptionDetailsReceived = details => ({
  type: SUBSCRIPTION_DETAILS_RECEIVED,
  payload: details,
});

export const subscriptionDetailsProcessing = isProcessing => ({
  type: SUBSCRIPTION_DETAILS_PROCESSING,
  payload: isProcessing,
});
