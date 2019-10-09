import { App } from '@edx/frontend-base';
import { createSelector } from 'reselect';
import { localeSelector, getCountryList } from '@edx/frontend-i18n';

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

export const queryParamsSelector = () => App.getQueryParams(global.location.search);

export const paymentSelector = createSelector(
  basketSelector,
  queryParamsSelector,
  (basket, queryParams) => {
    const isCouponRedeemRedirect =
      !!queryParams &&
      queryParams.coupon_redeem_redirect == 1; // eslint-disable-line eqeqeq
    return {
      ...basket,
      isCouponRedeemRedirect,
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
