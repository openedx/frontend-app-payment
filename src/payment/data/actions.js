import { utils } from '../../common';

const { AsyncActionType } = utils;

export const FETCH_BASKET = new AsyncActionType('PAYMENT', 'FETCH_BASKET');

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


export const UPDATE_QUANTITY = new AsyncActionType('PAYMENT', 'UPDATE_QUANTITY');

export const updateEnrollmentCodeQuantity = quantity => ({
  type: UPDATE_QUANTITY.BASE,
  payload: { quantity },
});

export const updateEnrollmentCodeQuantityBegin = () => ({
  type: UPDATE_QUANTITY.BEGIN,
});

export const updateEnrollmentCodeQuantitySuccess = result => ({
  type: UPDATE_QUANTITY.SUCCESS,
  payload: result,
});

export const updateEnrollmentCodeQuantityFailure = () => ({
  type: UPDATE_QUANTITY.FAILURE,
});
