import { createSelector } from 'reselect';

export const userAccountSelector = state => state.userAccount;

export const emailSelector = createSelector(
  userAccountSelector,
  userAccount => userAccount.email,
);

export const configurationSelector = state => state.configuration;
