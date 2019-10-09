import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-i18n';

import LocalizedPrice from './LocalizedPrice';

jest.mock('@edx/frontend-logging', () => ({
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
        currency: {
          currencyCode: null,
          conversionRate: 1,
        },
      },
      i18n: {
        locale: 'en',
      },
    };
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
    const tree = renderer.create(component).toJSON();
    expect(tree).toBeNull();
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
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render localized currency', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider
          store={mockStore(Object.assign({}, state, {
            payment: {
              currency: {
                currencyCode: 'MXN',
                conversionRate: 19,
              },
            },
          }))}
        >
          <LocalizedPrice amount={10} />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
