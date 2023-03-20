import { createSelector } from 'reselect';
import { storeName } from '../constants';

export const clientSecretSelector = state => (state[storeName] ? state[storeName].clientSecret : null);

export const getClientSecretSelector = createSelector(
  clientSecretSelector,
  (clientSecret, isClientSecretProcessing) => ({
    clientSecretId: clientSecret && clientSecret.capture_context ? clientSecret.capture_context.key_id : null,
    isClientSecretProcessing,
  }),
);
