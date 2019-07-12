import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import { IntlProvider, injectIntl, configure as configureI18n } from '@edx/frontend-i18n';

import { configuration } from '../../environment';
import messages from '../../i18n';

import ConnectedCouponForm, { CouponForm } from './CouponForm';

jest.mock('@edx/frontend-logging', () => ({
  logError: jest.fn(),
}));

configureI18n(configuration, messages);

const mockStore = configureMockStore();
const storeMocks = {
  defaultState: require('./__mocks__/defaultCouponState.mockStore.js'), // eslint-disable-line global-require
  percentageCouponAdded: require('./__mocks__/percentageCouponAdded.mockStore.js'), // eslint-disable-line global-require
  defaultCouponAdded: require('./__mocks__/defaultCouponAdded.mockStore.js'), // eslint-disable-line global-require
  couponEntered: require('./__mocks__/couponEntered.mockStore.js'), // eslint-disable-line global-require
};

describe('CouponForm', () => {
  it('should render the add coupon form', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider store={mockStore(storeMocks.defaultState)}>
          <ConnectedCouponForm
            addCoupon={jest.fn()}
            removeCoupon={jest.fn()}
            updateCouponDraft={jest.fn()}
          />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render a percentage coupon', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider store={mockStore(storeMocks.percentageCouponAdded)}>
          <ConnectedCouponForm
            addCoupon={jest.fn()}
            removeCoupon={jest.fn()}
            updateCouponDraft={jest.fn()}
          />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render an unexpected coupon', () => {
    const component = (
      <IntlProvider locale="en">
        <Provider store={mockStore(storeMocks.defaultCouponAdded)}>
          <ConnectedCouponForm
            addCoupon={jest.fn()}
            removeCoupon={jest.fn()}
            updateCouponDraft={jest.fn()}
          />
        </Provider>
      </IntlProvider>
    );
    const tree = renderer.create(component).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should call addCoupon on form submit', () => {
    const addCoupon = jest.fn();
    const IntlCouponForm = injectIntl(CouponForm);
    const wrapper = mount((
      <IntlProvider locale="en">
        <IntlCouponForm
          addCoupon={addCoupon}
          removeCoupon={jest.fn()}
          updateCouponDraft={jest.fn()}
          code="DEMO25"
        />
      </IntlProvider>
    ));

    wrapper.find('form').simulate('submit');
    expect(addCoupon).toHaveBeenCalledWith('DEMO25');
  });

  it('should call removeCoupon on form submit', () => {
    const removeCoupon = jest.fn();
    const IntlCouponForm = injectIntl(CouponForm);
    const wrapper = mount((
      <IntlProvider locale="en">
        <IntlCouponForm
          addCoupon={jest.fn()}
          removeCoupon={removeCoupon}
          updateCouponDraft={jest.fn()}
          code="DEMO25"
          id={12345}
        />
      </IntlProvider>
    ));

    wrapper.find('form').simulate('submit');
    expect(removeCoupon).toHaveBeenCalledWith(12345);
  });

  it('should call updateCouponDraft on code change', () => {
    const updateCouponDraft = jest.fn();
    const IntlCouponForm = injectIntl(CouponForm);
    const wrapper = mount((
      <IntlProvider locale="en">
        <IntlCouponForm
          addCoupon={jest.fn()}
          removeCoupon={jest.fn()}
          updateCouponDraft={updateCouponDraft}
          code="DEMO25"
        />
      </IntlProvider>
    ));

    wrapper.find('form').find('input').simulate('change', { target: { value: 'DEMO' } });
    expect(updateCouponDraft).toHaveBeenCalledWith('DEMO');
  });
});
