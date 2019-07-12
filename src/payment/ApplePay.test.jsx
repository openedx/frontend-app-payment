/* eslint-disable global-require */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';
import configureMockStore from 'redux-mock-store';

import { configuration } from '../environment';
import messages from '../i18n';
import { MESSAGE_TYPES } from '../feedback';
import ApplePay from './ApplePay';

const mockStore = configureMockStore();
const store = mockStore(require('./__mocks__/defaultState.mockStore.js'));

// Mock language cookie
Object.defineProperty(global.document, 'cookie', {
  writable: true,
  value: `${configuration.LANGUAGE_PREFERENCE_COOKIE_NAME}=en`,
});

configureI18n(configuration, messages);

describe('<ApplePay />', () => {
  const wrapper = mount((
    <IntlProvider locale="en">
      <Provider store={store}>
        <ApplePay
          totalAmount={10}
          lang="en"
          title="Pay with Apple Pay"
          addMessage="hi"
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
    const action = store.getActions()[0];
    expect(action.payload.code).toEqual('apple-pay-failure');
    expect(action.payload.messageType).toEqual(MESSAGE_TYPES.WARNING);
  });

  it('should add a message onPaymentAuthorizationFailure', () => {
    applePayButton.prop('onPaymentAuthorizationFailure')();
    const action = store.getActions()[0];
    expect(action.payload.code).toEqual('apple-pay-failure');
    expect(action.payload.messageType).toEqual(MESSAGE_TYPES.ERROR);
  });
});
