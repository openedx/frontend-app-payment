import { getQueryParameters } from '@edx/frontend-platform';
import { createSelector } from 'reselect';
import { localizedCurrencySelector } from './utils';
import { DEFAULT_STATUS } from '../checkout/payment-form/flex-microform/constants';
import { POLLING_PAYMENT_STATES, WAFFLE_FLAGS } from './constants';
import { isWaffleFlagEnabled } from '../../data/waffleFlags';

export const storeName = 'payment';

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
      paymentState: basket.paymentState ? basket.paymentState : '',
      isEmpty:
        basket.loaded && !basket.redirect && (!basket.products || basket.products.length === 0),
      isRedirect:
        (basket.loaded && !!basket.redirect) || (!basket.loaded && isCouponRedeemRedirect),
    };
  },
);

export const captureKeySelector = state => (state[storeName] ? state[storeName].captureKey : null);
export function submitErrorsSelector(formName) {
  return (state => (state.form && state.form[formName] ? state.form[formName].submitErrors : {}));
}

export const updateSubmitErrorsSelector = formName => createSelector(
  submitErrorsSelector(formName),
  submitErrors => ({ submitErrors }),
);

export const updateCaptureKeySelector = createSelector(
  captureKeySelector,
  captureKey => ({
    microformStatus: captureKey ? captureKey.microformStatus : DEFAULT_STATUS,
    captureKeyId: captureKey && captureKey.capture_context ? captureKey.capture_context.key_id : null,
  }),
);

export const clientSecretSelector = state => (state[storeName] ? state[storeName].clientSecret : null);

export const updateClientSecretSelector = createSelector(
  clientSecretSelector,
  clientSecret => ({
    clientSecretId: clientSecret && clientSecret.capture_context ? clientSecret.capture_context.key_id : null,
  }),
);

/**
 * Get the current payment processing state
 * @see PAYMENT_STATE
 * @param  {*} state global redux state
 * @return {string} a valid value from PAYMENT_STATE
 */
export const paymentProcessStatusSelector = state => (state[storeName].basket.paymentState);

/**
 * Determine if the current state warrants a run of the Payment Sate Polling Mechanism
 * @param state
 * @return boolean
 * @see POLLING_PAYMENT_STATES
 * @see WAFFLE_FLAGS.COMMERCE_COORDINATOR_ENABLED
 */
export const paymentProcessStatusShouldRunSelector = state => (
  POLLING_PAYMENT_STATES.includes(paymentProcessStatusSelector(state))
  && isWaffleFlagEnabled(WAFFLE_FLAGS.COMMERCE_COORDINATOR_ENABLED)
);

/**
 * Selector to see if the Payment Status Polling system is running.
 * @param state global redux state
 * @return {boolean}
 */
export const paymentProcessStatusIsPollingSelector = state => (state[storeName].basket.paymentStatePolling.keepPolling);
