/* eslint-disable global-require */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';
import configureMockStore from 'redux-mock-store';

import { configuration } from '../../environment';
import messages from '../../i18n';
import appleMessages from './ApplePay.messages';
import { addMessage, clearMessages, MESSAGE_TYPES } from '../../feedback';

jest.mock('./service', () => ({
  redirectToReceipt: jest.fn(),
}));

import { redirectToReceipt } from './service'; // eslint-disable-line import/first
import ApplePayButtonContainer from './ApplePayButtonContainer'; // eslint-disable-line import/first

const mockStore = configureMockStore();
const store = mockStore(require('../__mocks__/defaultState.mockStore.js'));

// Mock language cookie
Object.defineProperty(global.document, 'cookie', {
  writable: true,
  value: `${configuration.LANGUAGE_PREFERENCE_COOKIE_NAME}=en`,
});

configureI18n(configuration, messages);

describe('<ApplePayButtonContainer />', () => {
  let wrapper;
  let applePayButton;
  let beginHandler;
  let successHandler;
  let failureHandler;
  let cancelHandler;

  beforeEach(() => {
    beginHandler = jest.fn();
    successHandler = jest.fn();
    failureHandler = jest.fn();
    cancelHandler = jest.fn();
    wrapper = mount((
      <IntlProvider locale="en">
        <Provider store={store}>
          <ApplePayButtonContainer
            totalAmount={10}
            lang="en"
            title="Pay with Apple Pay"
            beginHandler={beginHandler}
            successHandler={successHandler}
            failureHandler={failureHandler}
            cancelHandler={cancelHandler}
            statePath={['payment', 'basket']}
          />
        </Provider>
      </IntlProvider>
    ));

    applePayButton = wrapper.find('ApplePayButton').first();
    store.clearActions();
  });

  it('should add a message onMerchantValidationFailure', () => {
    applePayButton.prop('onMerchantValidationFailure')();
    const failureMessage = appleMessages['payment.apple.pay.merchant.validation.failure'].defaultMessage;
    expect(store.getActions()).toEqual([
      clearMessages(),
      expect.objectContaining(addMessage('apple-pay-failure', failureMessage, null, MESSAGE_TYPES.WARNING)),
    ]);
    expect(failureHandler).toHaveBeenCalled();
  });

  it('should add a message onPaymentAuthorizationFailure', () => {
    applePayButton.prop('onPaymentAuthorizationFailure')();
    const failureMessage = appleMessages['payment.apple.pay.authorization.failure'].defaultMessage;
    expect(store.getActions()).toEqual([
      clearMessages(),
      expect.objectContaining(addMessage('apple-pay-failure', failureMessage, null, MESSAGE_TYPES.ERROR)),
    ]);
    expect(failureHandler).toHaveBeenCalled();
  });

  it('should call beginHandler onPaymentBegin of ApplePayButton', () => {
    applePayButton.prop('onPaymentBegin')();
    expect(beginHandler).toHaveBeenCalled();
  });

  it('should call cancelHandler onPaymentCancel of ApplePayButton', () => {
    applePayButton.prop('onPaymentCancel')();
    expect(cancelHandler).toHaveBeenCalled();
  });

  it('should call redirectToReceipt and successHandler on onPaymentComplete of ApplePayButton', () => {
    applePayButton.prop('onPaymentComplete')(123); // an order number

    expect(successHandler).toHaveBeenCalled();
    expect(redirectToReceipt).toHaveBeenCalledWith(123);
  });

  it('should not call handlers if unset', () => {
    wrapper = mount((
      <IntlProvider locale="en">
        <Provider store={store}>
          <ApplePayButtonContainer
            totalAmount={10}
            lang="en"
            title="Pay with Apple Pay"
            statePath={['payment', 'basket']}
          />
        </Provider>
      </IntlProvider>
    ));

    applePayButton = wrapper.find('ApplePayButton').first();
    // We have no begin, success, failure, or cancel handlers... invoking the handlers that use
    // them shouldn't result in any errors. This tests the code around those handlers which
    // protects us when they're undefined.
    applePayButton.prop('onMerchantValidationFailure')();
    applePayButton.prop('onPaymentAuthorizationFailure')();
    applePayButton.prop('onPaymentBegin')();
    applePayButton.prop('onPaymentCancel')();
    applePayButton.prop('onPaymentComplete')(123); // an order number
  });
});
