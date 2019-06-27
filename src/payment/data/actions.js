import { utils } from '../../common';

const { AsyncActionType } = utils;

export const FETCH_BASKET = new AsyncActionType('PAYMENT', 'FETCH_BASKET');
export const SDN_CHECK = new AsyncActionType('PAYMENT', 'SDN_CHECK');


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

export const sdnCheck = (firstName, lastName, city, country) => ({
  type: SDN_CHECK.BASE,
  payload: {
    firstName,
    lastName,
    city,
    country,
  },
});
