// import { createSelector } from 'reselect';
import { storeName } from '../constants';

// eslint-disable-next-line import/prefer-default-export
export const subscriptionStatusSelector = state => state[storeName].status;
