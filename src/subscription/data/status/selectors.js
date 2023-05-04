// import { createSelector } from 'reselect';
import { storeName } from '../constants';

// eslint-disable-next-line import/prefer-default-export
export const subscriptionStatusSelector = state => state[storeName].status;

// export const status = createSelector(
//   subscriptionStatusSelector,
//   status => status,
// );
