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
import ApplePayButtonContainer from './ApplePayButtonContainer';

const mockStore = configureMockStore();
const store = mockStore(require('../__mocks__/defaultState.mockStore.js'));

// Mock language cookie
Object.defineProperty(global.document, 'cookie', {
  writable: true,
  value: `${configuration.LANGUAGE_PREFERENCE_COOKIE_NAME}=en`,
});

configureI18n(configuration, messages);

describe('<ApplePayButtonContainer />', () => {
  const wrapper = mount((
    <IntlProvider locale="en">
      <Provider store={store}>
        <ApplePayButtonContainer
          totalAmount={10}
          lang="en"
          title="Pay with Apple Pay"
        />
      </Provider>
    </IntlProvider>
  ));
  const applePayButton = wrapper.find('ApplePayButton').first();

  beforeEach(() => {
    store.clearActions();
  });

  it('should add a message onMerchantValidationFailure', () => {
    applePayButton.prop('onMerchantValidationFailure')();
    const failureMessage = appleMessages['payment.apple.pay.merchant.validation.failure'].defaultMessage;
    expect(store.getActions()).toEqual([
      clearMessages(),
      expect.objectContaining(addMessage('apple-pay-failure', failureMessage, null, MESSAGE_TYPES.WARNING)),
    ]);
  });

  it('should add a message onPaymentAuthorizationFailure', () => {
    applePayButton.prop('onPaymentAuthorizationFailure')();
    const failureMessage = appleMessages['payment.apple.pay.authorization.failure'].defaultMessage;
    expect(store.getActions()).toEqual([
      clearMessages(),
      expect.objectContaining(addMessage('apple-pay-failure', failureMessage, null, MESSAGE_TYPES.ERROR)),
    ]);
  });
});
