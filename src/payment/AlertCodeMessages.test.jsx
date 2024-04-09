import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import {
  SingleEnrollmentCodeWarning,
  EnrollmentCodeQuantityUpdated,
  TransactionDeclined,
  DynamicPaymentMethodsNotCompatibleError,
  BasketChangedError,
} from './AlertCodeMessages';

const mockStore = configureMockStore();

describe('SingleEnrollmentCodeWarning', () => {
  it('should render with values', () => {
    const component = (
      <IntlProvider locale="en">
        <SingleEnrollmentCodeWarning values={{ courseAboutUrl: 'http://edx.org' }} />
      </IntlProvider>
    );
    const { container: tree } = render(component);
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
    const { container: tree } = render(component);
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
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });
});

describe('DynamicPaymentMethodsNotCompatibleError', () => {
  it('should render with values', () => {
    const component = (
      <IntlProvider locale="en">
        <DynamicPaymentMethodsNotCompatibleError />
      </IntlProvider>
    );
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });
});

describe('BasketChangedError', () => {
  it('should render with values', () => {
    const component = (
      <IntlProvider locale="en">
        <BasketChangedError />
      </IntlProvider>
    );
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });
});
