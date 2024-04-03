import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import Cookies from 'universal-cookie';

import LocalizedPrice from './LocalizedPrice';

jest.mock('universal-cookie', () => {
  class MockCookies {
    static result = {};

    get() {
      return MockCookies.result;
    }
  }
  return MockCookies;
});

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const mockStore = configureMockStore();

describe('LocalizedPrice', () => {
  let state;

  beforeEach(() => {
    state = {
      userAccount: { email: 'person@example.com' },
      payment: {
        basket: {
          loaded: false,
          loading: false,
          products: [],
        },
      },
      i18n: {
        locale: 'en',
      },
    };
    Cookies.result = undefined;
  });

  it('should render nothing by default', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore(state)}
        >
          <LocalizedPrice />
        </Provider>
      </IntlProvider>
    );
    const { container: tree } = render(component);
    expect(tree.children.length).toBe(0);
  });

  it('should render unlocalized currency', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore(state)}
        >
          <LocalizedPrice amount={10} />
        </Provider>
      </IntlProvider>
    );
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });

  it('should render localized currency', () => {
    Cookies.result = {
      code: 'MXN',
      rate: 19,
    };
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore({ ...state })}
        >
          <LocalizedPrice amount={10} />
        </Provider>
      </IntlProvider>
    );
    const { container: tree } = render(component);
    expect(tree).toMatchSnapshot();
  });
});
