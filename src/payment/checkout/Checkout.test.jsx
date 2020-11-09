import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { mount } from 'enzyme';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { Factory } from 'rosie';

import Checkout from './Checkout';
import { submitPayment } from '../data/actions';
import '../__factories__/basket.factory';
import '../__factories__/userAccount.factory';
import { transformResults } from '../data/service';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

configureI18n({
  config: {
    ENVIRONMENT: process.env.ENVIRONMENT,
    LANGUAGE_PREFERENCE_COOKIE_NAME: process.env.LANGUAGE_PREFERENCE_COOKIE_NAME,
  },
  loggingService: {
    logError: jest.fn(),
    logInfo: jest.fn(),
  },
  messages: {
    uk: {},
    th: {},
    ru: {},
    'pt-br': {},
    pl: {},
    'ko-kr': {},
    id: {},
    he: {},
    ca: {},
    'zh-cn': {},
    fr: {},
    'es-419': {},
    ar: {},
  },
});

const mockStore = configureMockStore();

const applePaySession = { begin: jest.fn() };
global.ApplePaySession = jest.fn().mockImplementation(() => applePaySession);
global.ApplePaySession.canMakePayments = () => true;

describe('<Checkout />', () => {
  let checkoutComponent; // eslint-disable-line no-unused-vars
  let wrapper;
  let store;
  let state;

  describe('with one product', () => {
    beforeEach(() => {
      const userAccount = Factory.build('userAccount');
      state = {
        authentication: {
          userId: 9,
          username: userAccount.username,
        },
        payment: {
          basket: Factory.build('basket', {}, { numProducts: 1 }),
        },
        i18n: {
          locale: 'en',
        },
      };

      sendTrackEvent.mockClear();
      store = mockStore(state);
      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <Checkout />
          </Provider>
        </IntlProvider>
      );
      wrapper = mount(component);
      checkoutComponent = wrapper
        .find('Checkout')
        .first()
        .instance();
    });

    it('submits and tracks paypal', () => {
      const paypalButton = wrapper
        .find('PayPalButton')
        .find('button')
        .hostNodes();
      paypalButton.simulate('click');

      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.basket.payment_selected', {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'PayPal',
      });
      expect(store.getActions().pop()).toEqual(submitPayment({ method: 'paypal' }));
    });

    // Apple Pay temporarily disabled per REV-927 - https://github.com/edx/frontend-app-payment/pull/256

    // FIXME: TEST: need to fake the microform somehow for this test to work
    // it('submits and tracks the payment form', () => {
    //   const formSubmitButton = wrapper.find('form button[type="submit"]').hostNodes();
    //   formSubmitButton.simulate('click');

    //   expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.basket.payment_selected', {
    //     type: 'click',
    //     category: 'checkout',
    //     paymentMethod: 'Credit Card',
    //     checkoutType: 'client_side',
    //     // flexMicroformEnabled: true,
    //   });
    // });

    it('fires an action when handling a cybersource submission', () => {
      const formData = { name: 'test' };
      checkoutComponent.handleSubmitCybersource(formData);

      expect(store.getActions().pop()).toEqual(submitPayment({ method: 'cybersource', ...formData }));
    });
  });

  describe('with a free checkout', () => {
    beforeEach(() => {
      const userAccount = Factory.build('userAccount');
      state = {
        authentication: {
          userId: 9,
          username: userAccount.username,
        },
        payment: {
          basket: transformResults(Factory.build(
            'basket',
            {
              is_free_basket: true,
            },
            { numProducts: 1 },
          )),
        },
        i18n: {
          locale: 'en',
        },
      };

      sendTrackEvent.mockClear();
      store = mockStore(state);
    });

    it('renders and tracks free checkout', () => {
      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <Checkout />
          </Provider>
        </IntlProvider>
      );
      wrapper = mount(component);

      const freeCheckoutButton = wrapper
        .find('FreeCheckoutOrderButton')
        .find('a')
        .hostNodes();
      freeCheckoutButton.simulate('click');

      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.basket.free_checkout', {
        type: 'click',
        category: 'checkout',
      });
    });
  });
});
