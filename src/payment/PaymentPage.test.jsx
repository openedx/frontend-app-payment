/* eslint-disable global-require */
import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';
import configureMockStore from 'redux-mock-store';

import * as analytics from '@edx/frontend-analytics';
import { ConnectedPaymentPage } from './';
import { configuration } from '../environment';
import messages from '../i18n';

const mockStore = configureMockStore();
const storeMocks = {
  defaultState: require('./__mocks__/defaultState.mockStore.js'),
  loading: require('./__mocks__/loading.mockStore.js'),
  loadingError: require('./__mocks__/loadingError.mockStore.js'),
  loadedBasket: require('./__mocks__/loadedBasket.mockStore.js'),
  loadedBasketWithNoTotals: require('./__mocks__/loadedBasketWithNoTotals.mockStore.js'),
};
const requirePaymentPageProps = {
  fetchBasket: () => {},
};

// Mock language cookie
Object.defineProperty(global.document, 'cookie', {
  writable: true,
  value: `${configuration.LANGUAGE_PREFERENCE_COOKIE_NAME}=en`,
});

configureI18n(configuration, messages);

describe('<PaymentPage />', () => {
  describe('Renders correctly in various states', () => {
    it('should render its default state', () => {
      analytics.sendTrackingLogEvent = jest.fn();
      const tree = renderer
        .create((
          <IntlProvider locale="en">
            <Provider store={mockStore(storeMocks.defaultState)}>
              <ConnectedPaymentPage {...requirePaymentPageProps} />
            </Provider>
          </IntlProvider>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render its loading state', () => {
      analytics.sendTrackingLogEvent = jest.fn();
      const tree = renderer
        .create((
          <IntlProvider locale="en">
            <Provider store={mockStore(storeMocks.loading)}>
              <ConnectedPaymentPage {...requirePaymentPageProps} />
            </Provider>
          </IntlProvider>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render errors', () => {
      analytics.sendTrackingLogEvent = jest.fn();
      const tree = renderer
        .create((
          <IntlProvider locale="en">
            <Provider store={mockStore(storeMocks.loadingError)}>
              <ConnectedPaymentPage {...requirePaymentPageProps} />
            </Provider>
          </IntlProvider>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render the basket', () => {
      analytics.sendTrackingLogEvent = jest.fn();
      const tree = renderer
        .create((
          <IntlProvider locale="en">
            <Provider store={mockStore(storeMocks.loadedBasket)}>
              <ConnectedPaymentPage {...requirePaymentPageProps} />
            </Provider>
          </IntlProvider>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should successfully render a basket with no order totals', () => {
      analytics.sendTrackingLogEvent = jest.fn();
      const tree = renderer
        .create((
          <IntlProvider locale="en">
            <Provider store={mockStore(storeMocks.loadedBasketWithNoTotals)}>
              <ConnectedPaymentPage {...requirePaymentPageProps} />
            </Provider>
          </IntlProvider>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
