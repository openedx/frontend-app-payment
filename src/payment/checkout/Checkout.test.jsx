/* eslint-disable global-require */
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { mount } from 'enzyme';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';

import { configuration } from '../../environment';
import messages from '../../i18n';
import Checkout from './Checkout';
import { submitPayment } from '../data/actions';

const storeMocks = {
  loadedBasket: require('../__mocks__/loadedBasket.mockStore.js'), // eslint-disable-line global-require
  freeCheckout: require('../__mocks__/loadedFreeBasket.mockStore.js'), // eslint-disable-line global-require
};

jest.mock('@edx/frontend-analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

import { sendTrackEvent } from '@edx/frontend-analytics'; // eslint-disable-line import/first

const mockStore = configureMockStore();
configureI18n(configuration, messages);

const applePaySession = { begin: jest.fn() };
global.ApplePaySession = jest.fn().mockImplementation(() => applePaySession);
global.ApplePaySession.canMakePayments = () => true;

describe('<Checkout />', () => {
  let checkoutComponent; // eslint-disable-line no-unused-vars
  let wrapper;
  let store;
  beforeEach(() => {
    sendTrackEvent.mockClear();
    store = mockStore(storeMocks.loadedBasket);
    wrapper = mount((
      <IntlProvider locale="en">
        <Provider store={store}>
          <Checkout />
        </Provider>
      </IntlProvider>
    ));
    checkoutComponent = wrapper.find('Checkout').first().instance();
  });

  it('submits and tracks paypal', () => {
    const paypalButton = wrapper.find('PayPalButton').find('button').hostNodes();
    paypalButton.simulate('click');

    expect(sendTrackEvent).toHaveBeenCalledWith(
      'edx.bi.ecommerce.basket.payment_selected',
      { type: 'click', category: 'checkout', paymentMethod: 'PayPal' },
    );
    expect(store.getActions().pop()).toEqual(submitPayment({ method: 'paypal' }));
  });

  it('submits and tracks apple pay', () => {
    const applePayButton = wrapper.find('ApplePayButton').find('button').hostNodes();
    applePayButton.simulate('click');

    expect(sendTrackEvent).toHaveBeenCalledWith(
      'edx.bi.ecommerce.basket.payment_selected',
      { type: 'click', category: 'checkout', paymentMethod: 'Apple Pay' },
    );
    expect(store.getActions().pop()).toEqual(submitPayment({ method: 'apple-pay' }));
  });

  it('submits and tracks the payment form', () => {
    const formSubmitButton = wrapper.find('form button[type="submit"]').hostNodes();
    formSubmitButton.simulate('click');

    expect(sendTrackEvent).toHaveBeenCalledWith(
      'edx.bi.ecommerce.basket.payment_selected',
      {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'Credit Card',
        checkoutType: 'client_side',
      },
    );

    // TODO: Add a full submission, right now we haven't filled out the form so we fail
    // client validation
    // expect(store.getActions().pop()).toEqual(submitPayment({ method: 'cybersource' }));
  });

  it('renders and tracks free checkout', () => {
    sendTrackEvent.mockClear();
    store = mockStore(storeMocks.freeCheckout);
    wrapper = mount((
      <IntlProvider locale="en">
        <Provider store={store}>
          <Checkout />
        </Provider>
      </IntlProvider>
    ));

    const freeCheckoutButton = wrapper.find('FreeCheckoutOrderButton').find('a').hostNodes();
    freeCheckoutButton.simulate('click');

    expect(sendTrackEvent).toHaveBeenCalledWith(
      'edx.bi.ecommerce.basket.free_checkout',
      { type: 'click', category: 'checkout' },
    );
  });
});
