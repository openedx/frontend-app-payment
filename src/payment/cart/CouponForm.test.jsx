import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import defaultsDeep from 'lodash.defaultsdeep';
import configureMockStore from 'redux-mock-store';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';

import { configuration } from '../../environment';
import messages from '../../i18n';
import CouponForm from './CouponForm';
import { addCoupon, removeCoupon } from '../data/actions';

jest.mock('@edx/frontend-analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

import { sendTrackEvent } from '@edx/frontend-analytics'; // eslint-disable-line import/first

configureI18n(configuration, messages);
const mockStore = configureMockStore();

const baseState = {
  payment: {
    basket: {
      coupons: [],
      isBasketProcessing: false,
    },
    currency: {},
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
    const tree = renderer.create(component).toJSON();
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
    const tree = renderer.create(component).toJSON();
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
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render a form when there is no coupon', () => {
    const component = renderCouponFormWithState(mockStore(baseState));
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('Add Coupon', () => {
    const store = mockStore(baseState);
    const component = renderCouponFormWithState(store);
    const wrapper = mount(component);

    it('sends a track event on clicking the add submit coupon button', () => {
      wrapper.find('button[type="submit"]').hostNodes().simulate('click');

      expect(sendTrackEvent).toHaveBeenCalledWith(
        'edx.bi.ecommerce.basket.voucher_applied',
        { type: 'click', category: 'voucher-application' },
      );
    });

    it('fires an add coupon action on submit', () => {
      wrapper.find('form').hostNodes().simulate('submit', {
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
    const wrapper = mount(component);

    it('fires an remove coupon action on submit', () => {
      wrapper.find('form').hostNodes().simulate('submit');

      expect(store.getActions()).toEqual([
        removeCoupon({ code: 1234 }),
      ]);
    });
  });
});
