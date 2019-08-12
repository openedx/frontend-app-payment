import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';

import { configuration } from '../../../environment';
import messages from '../../../i18n';

import ConnectedOrderDetails from './OrderDetails';
import { SEAT_PRODUCT_TYPE, COURSE_ENTITLEMENT_PRODUCT_TYPE, ENROLLMENT_CODE_PRODUCT_TYPE, VERIFIED_CERTIFICATE_TYPE, CREDIT_CERTIFICATE_TYPE } from './data/constants';

jest.mock('@edx/frontend-logging', () => ({
  logError: jest.fn(),
}));

configureI18n(configuration, messages);

const mockStore = configureMockStore();

describe('OrderDetails', () => {
  let state;

  beforeEach(() => {
    state = {
      userAccount: { email: 'staff@example.com' },
      payment: {
        basket: {
          loaded: false,
          loading: false,
          products: [],
        },
      },
    };
  });

  it('should render nothing by default', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore(state)}
        >
          <ConnectedOrderDetails />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toBeNull();
  });

  it('should render if given a store path', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore(state)}
        >
          <ConnectedOrderDetails storePath={['payment', 'basket']} />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toBeNull();
  });

  it('should render nothing if given an unknown product type', () => {
    state.payment.basket.products.push({
      productType: 'something else',
      certificateType: 'verified',
    });
    state.payment.basket.loaded = true;
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore(state)}
        >
          <ConnectedOrderDetails />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toBeNull();
  });

  it('should render course entitlement product message', () => {
    state.payment.basket.products.push({
      productType: COURSE_ENTITLEMENT_PRODUCT_TYPE,
      certificateType: 'verified', // Doesn't matter
    });
    state.payment.basket.loaded = true;
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore(state)}
        >
          <ConnectedOrderDetails />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    // This snapshot should be the message for the course entitlement product - a single sentence.
    expect(tree).toMatchSnapshot();
  });

  it('should render enrollment code product message', () => {
    state.payment.basket.products.push({
      productType: ENROLLMENT_CODE_PRODUCT_TYPE,
      certificateType: VERIFIED_CERTIFICATE_TYPE, // Doesn't matter
    });
    state.payment.basket.loaded = true;
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore(state)}
        >
          <ConnectedOrderDetails />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    // This snapshot should be a big list of bullet points and include the user's email at the end.
    expect(tree).toMatchSnapshot();
  });

  it('should render verified seat message', () => {
    state.payment.basket.products.push({
      productType: SEAT_PRODUCT_TYPE,
      certificateType: VERIFIED_CERTIFICATE_TYPE,
    });
    state.payment.basket.loaded = true;
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore(state)}
        >
          <ConnectedOrderDetails />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    // This snapshot should be the message for the verified seat product - a single sentence.
    expect(tree).toMatchSnapshot();
  });

  it('should render credit seat message', () => {
    state.payment.basket.products.push({
      productType: SEAT_PRODUCT_TYPE,
      certificateType: CREDIT_CERTIFICATE_TYPE,
    });
    state.payment.basket.loaded = true;
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore(state)}
        >
          <ConnectedOrderDetails />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    // This snapshot should be the message for the credit seat product - a single sentence.
    expect(tree).toMatchSnapshot();
  });

  it('should render seat message', () => {
    state.payment.basket.products.push({
      productType: SEAT_PRODUCT_TYPE,
      certificateType: 'something else', // needs to not be credit or verified.
    });
    state.payment.basket.loaded = true;
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore(state)}
        >
          <ConnectedOrderDetails />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    // This snapshot should be the message for a generic seat product - a single sentence.
    expect(tree).toMatchSnapshot();
  });
});
