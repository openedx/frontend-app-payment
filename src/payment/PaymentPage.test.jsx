/* eslint-disable global-require */
import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';
import configureMockStore from 'redux-mock-store';

import * as analytics from '@edx/frontend-analytics';
import ConnectedPaymentPage from './PaymentPage';
import { configuration } from '../environment';
import messages from '../i18n';

const mockStore = configureMockStore();
const storeMocks = {
  loadingApp: require('./__mocks__/loadingApp.mockStore.js'),
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
    it('app loading', () => {
      analytics.sendTrackingLogEvent = jest.fn();
      const tree = renderer
        .create((
          <IntlProvider locale="en">
            <Provider store={mockStore(storeMocks.loadingApp)}>
              <ConnectedPaymentPage {...requirePaymentPageProps} />
            </Provider>
          </IntlProvider>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
