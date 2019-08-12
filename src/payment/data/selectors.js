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

export const isBasketProcessingSelector = createSelector(
  basketSelector,
  basket => basket.isCouponProcessing || basket.isQuantityProcessing || basket.submitting,
);

export const cartSelector = createSelector(
  basketSelector,
  isBasketProcessingSelector,
  localizedCurrencySelector,
  (basket, isBasketProcessing, currency) => ({
    ...basket,
    isBasketProcessing,
    isCurrencyConverted: currency.showAsLocalizedCurrency,
  }),
);

export const currencyDisclaimerSelector = state => ({
  actualAmount: state[storeName].basket.orderTotal,
});

export const orderSummarySelector = createSelector(
  basketSelector,
  isBasketProcessingSelector,
  localizedCurrencySelector,
  (basket, isBasketProcessing, currency) => ({
    ...basket,
    isBasketProcessing,
    isCurrencyConverted: currency.showAsLocalizedCurrency,
  }),
);

export const updateQuantityFormSelector = createSelector(
  basketSelector,
  isBasketProcessingSelector,
  (basket, isBasketProcessing) => ({
    updateQuantity: basket.updateQuantity,
    summaryQuantity: basket.summaryQuantity,
    isBasketProcessing,
  }),
);

export const queryParametersSelector = state => state.queryParameters;

export const paymentSelector = createSelector(
  basketSelector,
  isBasketProcessingSelector,
  configurationSelector,
  queryParametersSelector,
  (basket, isBasketProcessing, configuration, queryParameters) => {
    const isCouponRedeemRedirect =
      queryParameters && queryParameters.coupon_redeem_redirect == 1; // eslint-disable-line eqeqeq
    return {
      ...basket,
      isCouponRedeemRedirect,
      isBasketProcessing,
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
