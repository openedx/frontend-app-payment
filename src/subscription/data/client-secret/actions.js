import { createRoutine } from 'redux-saga-routines';

// Created with redux-saga-routines
export const fetchClientSecret = createRoutine('FETCH_CLIENT_SECRET');

export const CLIENT_SECRET_PROCESSING = 'CLIENT_SECRET_PROCESSING';
export const CLIENT_SECRET_DATA_RECEIVED = 'CLIENT_SECRET_DATA_RECEIVED';

export const clientSecretProcessing = isProcessing => ({
  type: CLIENT_SECRET_PROCESSING,
  payload: isProcessing,
});

export const clientSecretDataReceived = clientSecret => ({
  type: CLIENT_SECRET_DATA_RECEIVED,
  payload: clientSecret,
});
