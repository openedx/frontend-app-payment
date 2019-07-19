import { utils } from '../../../common';

const { AsyncActionType } = utils;

export const SUBMIT_PAYMENT_CYBERSOURCE = new AsyncActionType('PAYMENT', 'SUBMIT_PAYMENT_CYBERSOURCE');

export const submitPaymentCybersource = (cardHolderInfo, cardDetails) => ({
  type: SUBMIT_PAYMENT_CYBERSOURCE.BASE,
  payload: {
    cardHolderInfo,
    cardDetails,
  },
});

export const submitPaymentCybersourceBegin = () => ({
  type: SUBMIT_PAYMENT_CYBERSOURCE.BEGIN,
});

export const submitPaymentCybersourceFailure = () => ({
  type: SUBMIT_PAYMENT_CYBERSOURCE.FAILURE,
});
