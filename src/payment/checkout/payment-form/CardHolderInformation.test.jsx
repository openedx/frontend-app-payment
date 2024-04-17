/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';
import { Provider } from 'react-redux';
import {
  IntlProvider,
  configure as configureI18n,
} from '@edx/frontend-platform/i18n';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { Factory } from 'rosie';
import { createStore } from 'redux';

import CardHolderInformation from './CardHolderInformation';
import PaymentForm from './PaymentForm';
import createRootReducer from '../../../data/reducers';
import { getCountryStatesMap, isPostalCodeRequired } from './utils/form-validators';

import '../../__factories__/userAccount.factory';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));
jest.mock('./utils/form-validators', () => ({
  getCountryStatesMap: jest.fn(),
  isPostalCodeRequired: jest.fn(),
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

describe('<CardHolderInformation />', () => {
  let store;

  describe('handleSelectCountry', () => {
    it('updates state with selected country', () => {
      const authenticatedUser = Factory.build('userAccount');

      store = createStore(createRootReducer(), {});
      render(
        <IntlProvider locale="en">
          <AppContext.Provider value={{ authenticatedUser }}>
            <Provider store={store}>
              <PaymentForm onSubmitPayment={() => {}} onSubmitButtonClick={() => {}}>
                <CardHolderInformation />
              </PaymentForm>
            </Provider>
          </AppContext.Provider>
        </IntlProvider>,
      );

      fireEvent.change(screen.getByLabelText('Country (required)'), { target: { value: 'US' } });

      expect(getCountryStatesMap).toHaveBeenCalledWith('US');
      expect(isPostalCodeRequired).toHaveBeenCalledWith('US', false); // DPM enabled added to the call
    });
  });
  describe('purchasedForOrganization field', () => {
    it('renders for bulk purchase', () => {
      const wrapper = render((
        <IntlProvider locale="en">
          <Provider store={store}>
            <PaymentForm
              isBulkOrder
              handleSubmit={() => {}}
              onSubmitPayment={() => {}}
              onSubmitButtonClick={() => {}}
            />
          </Provider>
        </IntlProvider>
      ));
      expect(wrapper.container.querySelector('#purchasedForOrganization')).toBeTruthy();
    });
    it('does not render if not bulk purchase', () => {
      const wrapper = render((
        <IntlProvider locale="en">
          <Provider store={store}>
            <PaymentForm
              handleSubmit={() => {}}
              onSubmitPayment={() => {}}
              onSubmitButtonClick={() => {}}
            />
          </Provider>
        </IntlProvider>
      ));
      expect(wrapper.container.querySelector('#purchasedForOrganization')).toBeFalsy();
    });
  });
});
