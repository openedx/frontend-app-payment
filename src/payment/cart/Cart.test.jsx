import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-i18n';
import { fetchUserAccountSuccess } from '@edx/frontend-auth';
import { Factory } from 'rosie';
import { createStore } from 'redux';
import Cookies from 'universal-cookie';

import '../__factories__/basket.factory';
import '../__factories__/userAccount.factory';
import Cart from './Cart';
import createRootReducer from '../../data/reducers';
import { fetchBasket, basketDataReceived } from '../data/actions';
import { transformResults } from '../data/service';


jest.mock('@edx/frontend-analytics', () => ({
  sendTrackEvent: jest.fn(),
}));
jest.mock('universal-cookie', () => {
  class MockCookies {
    static result = {};

    get() {
      return MockCookies.result;
    }
  }
  return MockCookies;
});


describe('<Cart />', () => {
  let store;
  let tree;
  let userAccount;

  beforeEach(() => {
    userAccount = Factory.build('userAccount');
    Cookies.result = undefined;
    store = createStore(createRootReducer(), {});
    store.dispatch(fetchUserAccountSuccess(userAccount));

    const component = (
      <IntlProvider locale="en">
        <Provider store={store}>
          <Cart />
        </Provider>
      </IntlProvider>
    );
    tree = renderer.create(component);
  });

  it('renders the loading skeleton', () => {
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('renders a basic, one product cart', () => {
    act(() => {
      store.dispatch(basketDataReceived(transformResults(Factory.build(
        'basket',
        {},
        { numProducts: 1 },
      ))));
      store.dispatch(fetchBasket.fulfill());
    });
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('renders a basic, one product cart with coupon form', () => {
    act(() => {
      store.dispatch(basketDataReceived(transformResults(Factory.build(
        'basket',
        { show_coupon_form: true },
        { numProducts: 1 },
      ))));
      store.dispatch(fetchBasket.fulfill());
    });
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('renders a cart with an offer', () => {
    act(() => {
      store.dispatch(basketDataReceived(transformResults(Factory.build(
        'basket',
        {
          offers: [{ benefitValue: 50, benefitType: 'Percentage', provider: 'Pied Piper' }],
        },
        { numProducts: 1 },
      ))));
      store.dispatch(fetchBasket.fulfill());
    });
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('renders a cart in non USD currency', () => {
    Cookies.result = {
      code: 'MXN',
      rate: 19.092733,
    };
    // This test uses its own setup since we don't have actions to update currency.
    store = createStore(
      createRootReducer(),
      {
        payment: {},
      },
    );
    const component = (
      <IntlProvider locale="en">
        <Provider store={store}>
          <Cart />
        </Provider>
      </IntlProvider>
    );
    tree = renderer.create(component);

    act(() => {
      store.dispatch(fetchUserAccountSuccess(userAccount));
      store.dispatch(basketDataReceived(transformResults(Factory.build(
        'basket',
        {},
        { numProducts: 1 },
      ))));
      store.dispatch(fetchBasket.fulfill());
    });

    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('renders a bulk enrollment cart', () => {
    act(() => {
      store.dispatch(fetchUserAccountSuccess(userAccount));
      store.dispatch(basketDataReceived(transformResults(Factory.build(
        'basket',
        {},
        { numProducts: 1, productType: 'Enrollment Code' },
      ))));
      store.dispatch(fetchBasket.fulfill());
    });

    expect(tree).toMatchSnapshot();
  });
});
