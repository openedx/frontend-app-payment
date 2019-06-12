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

export const addCouponSuccess = (voucherId, code, benefit) => ({
  type: ADD_COUPON.SUCCESS,
  payload: {
    benefit,
    code,
    voucherId,
  },
});

export const addCouponFailure = error => ({
  type: ADD_COUPON.FAILURE,
  payload: {
    error,
  },
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

export const removeCouponFailure = error => ({
  type: REMOVE_COUPON.FAILURE,
  payload: {
    error,
  },
});

// UPDATE COUPON DRAFT

export const updateCouponDraft = code => ({
  type: UPDATE_COUPON_DRAFT,
  payload: {
    code,
  },
});
