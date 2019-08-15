import { createSelector } from 'reselect';
import { localeSelector, getCountryList } from '@edx/frontend-i18n';

import { configurationSelector } from '../../common/selectors';

export const storeName = 'payment';

export const localizedCurrencySelector = (state) => {
  const { currencyCode, conversionRate } = state[storeName].currency;

  return {
    currencyCode,
    conversionRate,
    showAsLocalizedCurrency: typeof currencyCode === 'string' ? currencyCode !== 'USD' : false,
  };
};

export const basketSelector = state => state[storeName].basket;

export const cartSelector = createSelector(
  basketSelector,
  localizedCurrencySelector,
  (basket, currency) => ({
    ...basket,
    isCurrencyConverted: currency.showAsLocalizedCurrency,
  }),
);

export const currencyDisclaimerSelector = state => ({
  actualAmount: state[storeName].basket.orderTotal,
});

export const updateQuantityFormSelector = createSelector(
  basketSelector,
  basket => ({
    updateQuantity: basket.updateQuantity,
    summaryQuantity: basket.summaryQuantity,
    isBasketProcessing: basket.isBasketProcessing,
  }),
);

export const queryParametersSelector = state => state.queryParameters;

export const paymentSelector = createSelector(
  basketSelector,
  configurationSelector,
  queryParametersSelector,
  (basket, configuration, queryParameters) => {
    const isCouponRedeemRedirect =
      queryParameters && queryParameters.coupon_redeem_redirect == 1; // eslint-disable-line eqeqeq
    return {
      ...basket,
      isCouponRedeemRedirect,
      dashboardURL: configuration.LMS_BASE_URL,
      supportURL: configuration.SUPPORT_URL,
      ecommerceURL: configuration.ECOMMERCE_BASE_URL,
      isEmpty:
        basket.loaded && !basket.redirect && (!basket.products || basket.products.length === 0),
      isRedirect:
        (basket.loaded && !!basket.redirect) || (!basket.loaded && isCouponRedeemRedirect),
    };
  },
);

export const countryOptionsSelector = createSelector(
  localeSelector,
  locale => ({
    countryOptions: getCountryList(locale).map(({ code, name }) => ({ value: code, label: name })),
  }),
);
