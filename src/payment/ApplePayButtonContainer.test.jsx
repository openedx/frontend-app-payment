/* eslint-disable global-require */
import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';
import configureMockStore from 'redux-mock-store';

import { configuration } from '../environment';
import { submitPayment } from './data/actions';
import messages from '../i18n';
import ApplePayButtonContainer from './ApplePayButtonContainer';

const defaultStore = require('./__mocks__/defaultState.mockStore.js');


jest.mock('@edx/frontend-analytics', () => ({
  sendTrackEvent: jest.fn(),
}));
import { sendTrackEvent } from '@edx/frontend-analytics'; // eslint-disable-line import/first

// Mock language cookie
Object.defineProperty(global.document, 'cookie', {
  writable: true,
  value: `${configuration.LANGUAGE_PREFERENCE_COOKIE_NAME}=en`,
});

configureI18n(configuration, messages);
const mockStore = configureMockStore();
const applePaySession = { begin: jest.fn() };
global.ApplePaySession = jest.fn().mockImplementation(() => applePaySession);
global.ApplePaySession.canMakePayments = () => true;

describe('<ApplePayButtonContainer />', () => {
  it('should render properly', () => {
    const tree = renderer
      .create((
        <IntlProvider locale="en">
          <Provider store={mockStore(defaultStore)}>
            <ApplePayButtonContainer />
          </Provider>
        </IntlProvider>
      ))
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should be apple pay payment submission', () => {
    const store = mockStore(defaultStore);
    const wrapper = mount((
      <IntlProvider locale="en">
        <Provider store={store}>
          <ApplePayButtonContainer />
        </Provider>
      </IntlProvider>
    ));
    wrapper.find('ApplePayButtonContainer').simulate('click');

    // Track an event
    expect(sendTrackEvent).toHaveBeenCalled();

    // Dispatch the submit payment action
    const actions = store.getActions();
    expect(actions).toEqual([
      submitPayment({ method: 'apple-pay' }),
    ]);
  });
});
