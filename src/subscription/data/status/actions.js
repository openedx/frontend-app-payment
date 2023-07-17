import { createRoutine } from 'redux-saga-routines';

export const submit3DS = createRoutine('SUBMIT_3DS');

// Actions and their action creators
export const handleSuccessful3DS = createRoutine('HANDLE_SUCCESSFUL_3DS');
export const handleUnSuccessful3DS = createRoutine('HANDLE_UN_SUCCESSFUL_3DS');
export const SUBSCRIPTION_STATUS_RECEIVED = 'SUBSCRIPTION_STATUS_RECEIVED';

export const subscriptionStatusReceived = status => ({
  type: SUBSCRIPTION_STATUS_RECEIVED,
  payload: status,
});
