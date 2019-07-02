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

export const addCouponSuccess = (id, code, benefitValue) => ({
  type: ADD_COUPON.SUCCESS,
  payload: {
    benefitValue,
    code,
    id,
  },
});

export const addCouponFailure = errorCode => ({
  type: ADD_COUPON.FAILURE,
  payload: {
    errorCode,
  },
});

// REMOVE COUPON

export const removeCoupon = id => ({
  type: REMOVE_COUPON.BASE,
  payload: {
    id,
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

export const removeCouponFailure = errorCode => ({
  type: REMOVE_COUPON.FAILURE,
  payload: {
    errorCode,
  },
});

// UPDATE COUPON DRAFT

export const updateCouponDraft = code => ({
  type: UPDATE_COUPON_DRAFT,
  payload: {
    code,
  },
});
