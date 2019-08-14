/* eslint-disable global-require */
import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import defaultsDeep from 'lodash.defaultsdeep';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';

import { configuration } from '../../environment';
import messages from '../../i18n';
import Cart from './Cart';

const mockStore = configureMockStore();
configureI18n(configuration, messages);

const loadedBasketState = {
  userAccount: {
    loading: false,
    error: null,
    username: 'staff',
    email: 'staff@example.com',
    bio: null,
    name: null,
    country: null,
    socialLinks: null,
    profileImage: {
      imageUrlMedium: null,
      imageUrlLarge: null,
    },
    levelOfEducation: null,
  },
  payment: {
    basket: {
      loaded: true,
      loading: false,
      isCouponProcessing: false,
      isQuantityProcessing: false,
      isFreeBasket: false,
      showCouponForm: true,
      paymentProviders: [
        {
          type: 'cybersource',
        },
        {
          type: 'paypal',
        },
      ],
      orderTotal: 149,
      summaryDiscounts: 12,
      summaryPrice: 161,
      products: [
        {
          imageUrl: '',
          title: 'Introduction to Happiness',
          certificateType: 'verified',
          productType: 'Seat',
          sku: '8CF08E5',
        },
      ],
      coupons: [],
      offers: [],
    },
    currency: {},
  },
};

const renderCartWithStore = state => renderer.create((
  <IntlProvider locale="en">
    <Provider store={mockStore(state)}>
      <Cart />
    </Provider>
  </IntlProvider>
));

describe('<Cart />', () => {
  it('renders a default cart', () => {
    const tree = renderCartWithStore(loadedBasketState).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a cart with an offer', () => {
    const state = defaultsDeep({
      payment: {
        basket: {
          offers: [
            { benefitValue: 50, benefitType: 'Percentage', provider: 'Pied Piper' },
          ],
        },
      },
    }, loadedBasketState);

    const tree = renderCartWithStore(state).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a cart without a coupon form', () => {
    const state = defaultsDeep({
      payment: {
        basket: {
          showCouponForm: false,
        },
      },
    }, loadedBasketState);

    const tree = renderCartWithStore(state).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a cart in non USD currency', () => {
    const state = defaultsDeep({
      payment: {
        basket: {
          currency: 'USD',
        },
        currency: {
          currencyCode: 'MXN',
          conversionRate: 19.092733,
        },
      },
    }, loadedBasketState);

    const tree = renderCartWithStore(state).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a bulk enrollment cart', () => {
    const state = defaultsDeep({
      payment: {
        basket: {
          orderType: 'Enrollment Code',
          showCouponForm: false,
        },
      },
    }, loadedBasketState);

    const tree = renderCartWithStore(state).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders a loading cart skeleton', () => {
    const state = defaultsDeep({
      payment: {
        basket: {
          loading: true,
        },
      },
    }, loadedBasketState);

    const tree = renderCartWithStore(state).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
