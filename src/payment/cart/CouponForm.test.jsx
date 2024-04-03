import React from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react';
import defaultsDeep from 'lodash.defaultsdeep';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

import CouponForm from './CouponForm';
import { addCoupon, removeCoupon } from '../data/actions';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

const mockStore = configureMockStore();

const baseState = {
  payment: {
    basket: {
      coupons: [],
      isBasketProcessing: false,
    },
  },
};

const baseCoupon = {
  id: 1234,
  code: 'COUPONCODE',
  benefitValue: '10',
  benefitType: 'Absolute',
};

const renderCouponFormWithState = store => (
  <IntlProvider locale="en">
    <Provider store={store}>
      <CouponForm />
    </Provider>
  </IntlProvider>
);

describe('CouponForm', () => {
  it('should render an absolute value coupon', () => {
    const component = renderCouponFormWithState(mockStore(defaultsDeep({
      payment: {
        basket: {
          coupons: [{ ...baseCoupon, benefitType: 'Absolute' }],
        },
      },
    }, baseState)));
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });

  it('should render a percentage value coupon', () => {
    const component = renderCouponFormWithState(mockStore(defaultsDeep({
      payment: {
        basket: {
          coupons: [{ ...baseCoupon, benefitType: 'Percentage' }],
        },
      },
    }, baseState)));
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });

  it('should render a coupon even if no known benefitType is supplied', () => {
    const component = renderCouponFormWithState(mockStore(defaultsDeep({
      payment: {
        basket: {
          coupons: [{ ...baseCoupon, benefitType: 'Barter' }],
        },
      },
    }, baseState)));
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });

  it('should render a form when there is no coupon', () => {
    const component = renderCouponFormWithState(mockStore(baseState));
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });

  describe('Add Coupon', () => {
    it('sends a track event on clicking the add submit coupon button', () => {
      const store = mockStore(baseState);
      const component = renderCouponFormWithState(store);
      const { container } = render(component);
      fireEvent.click(container.querySelector('button[type="submit"]'));

      expect(sendTrackEvent).toHaveBeenCalledWith(
        'edx.bi.ecommerce.basket.voucher_applied',
        { type: 'click', category: 'voucher-application' },
      );
    });

    it('fires an add coupon action on submit', () => {
      const store = mockStore(baseState);
      const component = renderCouponFormWithState(store);
      const { container } = render(component);
      fireEvent.submit(container.querySelector('button[type="submit"]'), {
        target: { elements: { couponField: { value: 'testvalue' } } },
      });

      expect(store.getActions()).toEqual([
        addCoupon({ code: 'testvalue' }),
      ]);
    });
  });

  describe('Remove Coupon', () => {
    const store = mockStore(defaultsDeep({
      payment: {
        basket: {
          coupons: [baseCoupon],
        },
      },
    }, baseState));
    const component = renderCouponFormWithState(store);

    it('fires an remove coupon action on submit', () => {
      const { container } = render(component);
      fireEvent.submit(container.querySelector('form'));

      expect(store.getActions()).toEqual([
        removeCoupon({ id: 1234 }),
      ]);
    });
  });
});
