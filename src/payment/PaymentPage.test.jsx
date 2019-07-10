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

import ProductLineItem from './ProductLineItem';

const mockStore = configureMockStore();
const storeMocks = {
  defaultState: require('./__mocks__/defaultState.mockStore.js'),
  loading: require('./__mocks__/loading.mockStore.js'),
  loadedBasket: require('./__mocks__/loadedBasket.mockStore.js'),
  loadedFreeBasket: require('./__mocks__/loadedFreeBasket.mockStore.js'),
  loadedEmptyBasket: require('./__mocks__/loadedEmptyBasket.mockStore.js'),
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

    it('should render an empty basket', () => {
      analytics.sendTrackingLogEvent = jest.fn();
      const tree = renderer
        .create((
          <IntlProvider locale="en">
            <Provider store={mockStore(storeMocks.loadedEmptyBasket)}>
              <ConnectedPaymentPage {...requirePaymentPageProps} />
            </Provider>
          </IntlProvider>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should render a free basket', () => {
      analytics.sendTrackingLogEvent = jest.fn();
      const tree = renderer
        .create((
          <IntlProvider locale="en">
            <Provider store={mockStore(storeMocks.loadedFreeBasket)}>
              <ConnectedPaymentPage {...requirePaymentPageProps} />
            </Provider>
          </IntlProvider>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});

const product = {
  imageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/21be6203-b140-422c-9233-a1dc278d7266-941abf27df4d.small.jpg',
  title: 'Introduction to Happiness',
  certificateType: 'verified',
  productType: 'Seat',
  sku: '8CF08E5',
};

describe('<ProductLineItem />', () => {
  describe('Rendering', () => {
    it('should render the product details', () => {
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for professional certificate', () => {
      product.certificateType = 'professional';
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for no-id-professional certificate', () => {
      product.certificateType = 'no-id-professional';
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for verified certificate', () => {
      product.certificateType = 'verified';
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for unknown seat type', () => {
      product.certificateType = null;
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for honor certificate', () => {
      product.certificateType = 'honor';
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
    it('should render the product details for audit certificate', () => {
      product.certificateType = 'audit';
      const tree = renderer.create((
        <IntlProvider locale="en">
          <ProductLineItem {...product} />
        </IntlProvider>
      )).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
