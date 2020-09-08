import { getConfig, getQueryParameters } from '@edx/frontend-platform';
import { createSelector } from 'reselect';
import Cookies from 'universal-cookie';
import { isWaffleFlagEnabled } from './utils';

export const storeName = 'payment';

export const localizedCurrencySelector = () => {
  const cookie = new Cookies().get(getConfig().CURRENCY_COOKIE_NAME);
  let currencyCode;
  let conversionRate;

  if (cookie && typeof cookie.code === 'string' && typeof cookie.rate === 'number') {
    currencyCode = cookie.code;
    conversionRate = cookie.rate;
  }

  const showAsLocalizedCurrency = typeof currencyCode === 'string' ? currencyCode !== 'USD' : false;

  return {
    currencyCode,
    conversionRate,
    showAsLocalizedCurrency,
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

export const queryParamsSelector = () => getQueryParameters(global.location.search);

export const paymentSelector = createSelector(
  basketSelector,
  queryParamsSelector,
  (basket, queryParams) => {
    const isCouponRedeemRedirect = !!queryParams
      && queryParams.coupon_redeem_redirect == 1; // eslint-disable-line eqeqeq
    return {
      ...basket,
      isCouponRedeemRedirect,
      isEmpty:
        basket.loaded && !basket.redirect && (!basket.products || basket.products.length === 0),
      isRedirect:
        (basket.loaded && !!basket.redirect) || (!basket.loaded && isCouponRedeemRedirect),
      // flexMicroformEnabled: isWaffleFlagEnabled('payment.cybersource.flex_microform_enabled', false),
      // captureKeyId: basket.captureContext ? basket.captureContext.keyId : null,
    };
  },
);

export const captureKeySelector = state => state[storeName].captureKey;

export const updateCaptureKeySelector = createSelector(
  captureKeySelector,
  captureKey => ({
    flexMicroformEnabled: isWaffleFlagEnabled('payment.cybersource.flex_microform_enabled', false),
    captureKeyId: captureKey.captureContext ? captureKey.captureContext.keyId : null,
  }),
);
