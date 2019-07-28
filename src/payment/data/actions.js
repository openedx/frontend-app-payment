import { createRoutine } from 'redux-saga-routines';


// Routines are action + action creator pairs in a series.
// Actions adhere to the flux standard action format.
// Routines by default are in the form of:
//
// Action                |   Action Creator
// -----------------------------------------------
// fetchBasket.TRIGGER   |   fetchBasket()
// fetchBasket.SUCCESS   |   fetchBasket.success()
// fetchBasket.FAILURE   |   fetchBasket.failure()
// fetchBasket.FULFILL   |   fetchBasket.fulfill()
//
// Created with redux-saga-routines
export const fetchBasket = createRoutine('FETCH_BASKET');
export const addCoupon = createRoutine('ADD_COUPON');
export const removeCoupon = createRoutine('REMOVE_COUPON');
export const updateQuantity = createRoutine('UPDATE_QUANTITY');


// Actions and their action creators
export const BASKET_DATA_RECEIVED = 'BASKET_DATA_RECEIVED';

export const basketDataReceived = basket => ({
  type: BASKET_DATA_RECEIVED,
  payload: basket,
});
