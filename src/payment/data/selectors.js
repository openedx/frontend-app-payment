import { createSelector } from 'reselect';
import {
  localeSelector,
  getCountryList,
} from '@edx/frontend-i18n';

export const storeName = 'payment';
export const paymentSelector = (state) => {
  const paymentState = state[storeName].basket;
  const loaded = !paymentState.loading && !paymentState.loadingError;
  return {
    ...paymentState,
    loaded,
    isEmpty: loaded && paymentState.products && paymentState.products.length > 0,
  };
};

export const countryOptionsSelector = createSelector(
  localeSelector,
  locale => ({
    countryOptions: getCountryList(locale).map(({ code, name }) => ({ value: code, label: name })),
  }),
);

export const basketSelector = state => ({ ...state[storeName].basket });

export const productsSelector = state => ({ ...state[storeName].basket });
