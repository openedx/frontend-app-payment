import { createStore } from 'redux';

import reducer from './reducers';
import { addCouponBegin, addCouponSuccess, addCouponFailure, removeCouponBegin, removeCouponSuccess, removeCouponFailure, updateCouponDraft, ADD_COUPON, addCoupon, removeCoupon, REMOVE_COUPON } from './actions';
import { PERCENTAGE_BENEFIT } from './constants';

describe('redux tests', () => {
  let store;
  beforeEach(() => {
    store = createStore(reducer);
  });

  it('should return default state in reducer if no action', () => {
    expect(reducer()).toEqual({
      benefit: null,
      code: null,
      voucherId: null,
      error: null,
      loaded: false,
      loading: false,
    });
  });

  it('should match default state', () => {
    expect(store.getState()).toMatchSnapshot();
  });

  it('should begin to add a coupon', () => {
    store.dispatch(addCouponBegin());
    expect(store.getState()).toMatchSnapshot();
  });

  it('should successfully add a coupon', () => {
    store.dispatch(addCouponSuccess(12345, 'DEMO25', { type: PERCENTAGE_BENEFIT, value: 25 }));
    expect(store.getState()).toMatchSnapshot();
  });

  it('should fail to add a coupon', () => {
    store.dispatch(addCouponFailure('oh noes'));
    expect(store.getState()).toMatchSnapshot();
  });

  it('should begin to remove a coupon', () => {
    store.dispatch(addCouponSuccess(12345, 'DEMO25', { type: PERCENTAGE_BENEFIT, value: 25 }));
    store.dispatch(removeCouponBegin());
    expect(store.getState()).toMatchSnapshot();
  });

  it('should successfully remove a coupon', () => {
    store.dispatch(addCouponSuccess(12345, 'DEMO25', { type: PERCENTAGE_BENEFIT, value: 25 }));
    store.dispatch(removeCouponSuccess());
    expect(store.getState()).toMatchSnapshot();
  });

  it('should fail to remove a coupon', () => {
    store.dispatch(addCouponSuccess(12345, 'DEMO25', { type: PERCENTAGE_BENEFIT, value: 25 }));
    store.dispatch(removeCouponFailure('oh noes it didnt'));
    expect(store.getState()).toMatchSnapshot();
  });

  it('should update the code draft', () => {
    store.dispatch(updateCouponDraft('DEM'));
    expect(store.getState()).toMatchSnapshot();
    store.dispatch(updateCouponDraft('DEMO25'));
    expect(store.getState()).toMatchSnapshot();
  });

  /**
   * This action is tested independently because the reducer doesn't directly respond to it.
   * It's for the saga.
   */
  it('should produce an addCoupon action', () => {
    expect(addCoupon('DEMO25')).toEqual({
      type: ADD_COUPON.BASE,
      payload: {
        code: 'DEMO25',
      },
    });
  });

  /**
   * This action is tested independently because the reducer doesn't directly respond to it.
   * It's for the saga.
   */
  it('should produce an removeCoupon action', () => {
    expect(removeCoupon(12345)).toEqual({
      type: REMOVE_COUPON.BASE,
      payload: {
        voucherId: 12345,
      },
    });
  });
});
