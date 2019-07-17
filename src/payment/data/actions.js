import { utils } from '../../common';

const { AsyncActionType } = utils;

export const FETCH_BASKET = new AsyncActionType('PAYMENT', 'FETCH_BASKET');
export const SUBMIT_PAYMENT = new AsyncActionType('PAYMENT', 'SUBMIT_PAYMENT');
export const CHECKOUT = new AsyncActionType('PAYMENT', 'CHECKOUT');


export const fetchBasket = () => ({
  type: FETCH_BASKET.BASE,
  payload: {},
});

export const fetchBasketBegin = () => ({
  type: FETCH_BASKET.BEGIN,
});

export const fetchBasketSuccess = result => ({
  type: FETCH_BASKET.SUCCESS,
  payload: result,
});

export const fetchBasketFailure = () => ({
  type: FETCH_BASKET.FAILURE,
});

export const submitPayment = cardHolderInfo => ({
  type: SUBMIT_PAYMENT.BASE,
  payload: {
    cardHolderInfo,
  },
});

export const submitPaymentBegin = () => ({
  type: SUBMIT_PAYMENT.BEGIN,
});

export const submitPaymentFailure = () => ({
  type: SUBMIT_PAYMENT.FAILURE,
});

export const checkoutSuccess = (paymentProcessorUrl, paymentProcessorFormFields) => ({
  type: CHECKOUT.SUCCESS,
  payload: {
    paymentProcessorUrl,
    paymentProcessorFormFields,
  },
});
