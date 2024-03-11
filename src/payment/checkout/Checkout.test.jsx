import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-platform/i18n';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { Factory } from 'rosie';

import Checkout from './Checkout';
import * as formValidators from './payment-form/utils/form-validators';
import { submitPayment } from '../data/actions';
import '../__factories__/basket.factory';
import '../__factories__/userAccount.factory';
import { transformResults } from '../data/utils';
import { getPerformanceProperties } from '../performanceEventing';

const validateRequiredFieldsMock = jest.spyOn(formValidators, 'validateRequiredFields');
const validateCardDetailsMock = jest.spyOn(formValidators, 'validateCardDetails');

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

jest.useFakeTimers('modern');

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
      window.microform = { Mockroform: true };

      const component = (
        <IntlProvider locale="en">
          <Provider store={store}>
            <Checkout />
          </Provider>
        </IntlProvider>
      );
      wrapper = render(component);
    });

    it('submits and tracks paypal', async () => {
      const paypalButton = await screen.findByTestId('PayPalButton');
      fireEvent.click(paypalButton);

      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.basket.payment_selected', {
        type: 'click',
        category: 'checkout',
        stripeEnabled: false,
        paymentMethod: 'PayPal',
      });
      expect(store.getActions().pop()).toEqual(submitPayment({ method: 'paypal' }));
    });

    // Apple Pay temporarily disabled per REV-927 - https://github.com/openedx/frontend-app-payment/pull/256

    it('submits and tracks the payment form', () => {
      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.payment_mfe.payment_form_rendered', {
        ...getPerformanceProperties(),
        paymentProcessor: 'Cybersource',
      });
      const formSubmitButton = wrapper.container.querySelector('form button[type="submit"]');
      fireEvent.click(formSubmitButton);

      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.basket.payment_selected', {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'Credit Card',
        checkoutType: 'client_side',
        flexMicroformEnabled: true,
        stripeEnabled: false,
      });
    });

    it('fires an action when handling a cybersource submission', () => {
      validateRequiredFieldsMock.mockReturnValueOnce({});
      validateCardDetailsMock.mockReturnValueOnce({});

      const firstNameField = wrapper.container.querySelector('#firstName');
      const lastNameField = wrapper.container.querySelector('#lastName');

      fireEvent.change(firstNameField, { target: { value: 'John' } });
      fireEvent.change(lastNameField, { target: { value: 'Doe' } });
      fireEvent.submit(screen.getByTestId('payment-form'));

      store.getActions().pop();
      expect(store.getActions().pop()).toMatchObject(submitPayment({ method: 'cybersource' }));
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

    it('renders and tracks free checkout', async () => {
      render(
        <IntlProvider locale="en">
          <Provider store={store}>
            <Checkout />
          </Provider>
        </IntlProvider>,
      );

      const freeCheckoutButton = await screen.findByRole('link', { name: /place order/i });
      fireEvent.click(freeCheckoutButton);

      expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.basket.free_checkout', {
        type: 'click',
        stripeEnabled: false,
        category: 'checkout',
      });
    });
  });
});
