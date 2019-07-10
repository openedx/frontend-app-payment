import { createSelector } from 'reselect';
import { localeSelector, getCountryList } from '@edx/frontend-i18n';

import { configurationSelector } from '../../common/selectors';

export const storeName = 'payment';

export const basketSelector = state => ({ ...state[storeName].basket });
export const productsSelector = state => ({ ...state[storeName].basket });

export const paymentSelector = createSelector(
  basketSelector,
  configurationSelector,
  (basket, configuration) => ({
    ...basket,
    dashboardURL: configuration.LMS_BASE_URL,
    supportURL: configuration.SUPPORT_URL,
    ecommerceURL: configuration.ECOMMERCE_BASE_URL,
    isEmpty: basket.loaded && (!basket.products || basket.products.length === 0),
  }),
);

export const countryOptionsSelector = createSelector(
  localeSelector,
  locale => ({
    countryOptions: getCountryList(locale).map(({ code, name }) => ({ value: code, label: name })),
  }),
);
