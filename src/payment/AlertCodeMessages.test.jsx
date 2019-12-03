import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import {
  SingleEnrollmentCodeWarning,
  EnrollmentCodeQuantityUpdated,
  TransactionDeclined,
} from './AlertCodeMessages';

const mockStore = configureMockStore();

describe('SingleEnrollmentCodeWarning', () => {
  it('should render with values', () => {
    const component = (
      <IntlProvider locale="en">
        <SingleEnrollmentCodeWarning values={{ courseAboutUrl: 'http://edx.org' }} />
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('EnrollmentCodeQuantityUpdated', () => {
  it('should render with values', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore()}
        >
          <EnrollmentCodeQuantityUpdated values={{ quantity: 2, price: 100 }} />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('TransactionDeclined', () => {
  it('should render with values', () => {
    const component = (
      <IntlProvider locale="en">
        <TransactionDeclined />
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
