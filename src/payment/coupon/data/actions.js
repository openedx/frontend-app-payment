import { AsyncActionType } from '../../../common/utils';

export const ADD_COUPON = new AsyncActionType('PAYMENT', 'ADD_COUPON');
export const REMOVE_COUPON = new AsyncActionType('PAYMENT', 'REMOVE_COUPON');
export const UPDATE_COUPON_DRAFT = 'PAYMENT__UPDATE_COUPON_DRAFT';

// ADD COUPON

export const addCoupon = code => ({
  type: ADD_COUPON.BASE,
  payload: {
    code,
  },
});

export const addCouponBegin = () => ({
  type: ADD_COUPON.BEGIN,
});

export const addCouponSuccess = (code, voucherId) => ({
  type: ADD_COUPON.SUCCESS,
  payload: {
    code,
    voucherId,
  },
});

export const addCouponFailure = message => ({
  type: ADD_COUPON.FAILURE,
  payload: {
    message,
  },
});

export const addCouponReset = () => ({
  type: ADD_COUPON.RESET,
});

// REMOVE COUPON

export const removeCoupon = voucherId => ({
  type: REMOVE_COUPON.BASE,
  payload: {
    voucherId,
  },
});

export const removeCouponBegin = () => ({
  type: REMOVE_COUPON.BEGIN,
});

export const removeCouponSuccess = result => ({
  type: REMOVE_COUPON.SUCCESS,
  payload: {
    result,
  },
});

export const removeCouponFailure = message => ({
  type: REMOVE_COUPON.FAILURE,
  payload: {
    message,
  },
});

export const removeCouponReset = () => ({
  type: REMOVE_COUPON.RESET,
});

export const updateCouponDraft = code => ({
  type: UPDATE_COUPON_DRAFT,
  payload: {
    code,
  },
});
