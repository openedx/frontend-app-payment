import { utils } from '../../../common';

const { AsyncActionType } = utils;

export const SUBMIT_PAYMENT_PAYPAL = new AsyncActionType('PAYMENT', 'SUBMIT_PAYMENT_PAYPAL');

export const submitPaymentPayPal = () => ({
  type: SUBMIT_PAYMENT_PAYPAL.BASE,
});

export const submitPaymentPayPalBegin = () => ({
  type: SUBMIT_PAYMENT_PAYPAL.BEGIN,
});

export const submitPaymentPayPalFailure = () => ({
  type: SUBMIT_PAYMENT_PAYPAL.FAILURE,
});
