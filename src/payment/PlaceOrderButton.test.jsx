import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-i18n';
import configureMockStore from 'redux-mock-store';

import PlaceOrderButton from './PlaceOrderButton';

jest.mock('@edx/frontend-analytics');

import { sendTrackEvent } from '@edx/frontend-analytics'; // eslint-disable-line

describe('PlaceOrderButton', () => {
  it('should call sendTrackEvent when clicked', () => {
    const mockStore = configureMockStore();

    const store = mockStore({
      configuration: {
        ECOMMERCE_BASE_URL: 'boo',
      },
      payment: {
        basket: {
          loaded: true,
          products: [],
        },
        currency: {},
      },
    });

    const component = (
      <IntlProvider locale="en">
        <Provider store={store}>
          <PlaceOrderButton />
        </Provider>
      </IntlProvider>
    );

    const wrapper = mount(component);
    wrapper.find('.btn.btn-primary.btn-lg').simulate('click');
    expect(sendTrackEvent).toHaveBeenCalledWith('edx.bi.ecommerce.basket.free_checkout', {
      type: 'click',
      category: 'checkout',
    });
  });
});
