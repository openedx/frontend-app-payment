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

  describe('without logging errors', () => {
    /**
     * Explanation: Why do this?  This test is in anticipation of there being coupon types we
     * didn't expect.  We want the UI to at least display a message in these cases, even if we
     * weren't expecting them, because the alternative is to show no text at all with a "Remove"
     * button referencing nothing.  Because this is the basket page, we want to be
     * over-cautious and let the UI support it in a minimal way.
     *
     * We want the CouponForm renderRemove() to continue to warn us about unexpected types in
     * development, but we want to have good fallback behavior in prod, where the console.errors
     * won't show up.  Therefore, we're hiding the errors here so that we don't have developers
     * seeing false positives on test failures (when they aren't actually failures!)
     */
    let originalError;

    beforeEach(() => {
      originalError = console.error; // eslint-disable-line no-console
      console.error = jest.fn(); // eslint-disable-line no-console
    });

    afterEach(() => {
      console.error = originalError; // eslint-disable-line no-console
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

  describe('error handling', () => {
    const IntlCouponForm = injectIntl(CouponForm);

    function createComponent(errorCode) {
      return (
        <IntlProvider locale="en">
          <IntlCouponForm
            addCoupon={jest.fn()}
            removeCoupon={jest.fn()}
            updateCouponDraft={jest.fn()}
            code="DEMO25"
            errorCode={errorCode}
          />
        </IntlProvider>
      );
    }

    it('should match error state snapshot', () => {
      const tree = renderer.create(createComponent('unknown_error')).toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('should display empty_basket errors correctly', () => {
      const wrapper = mount(createComponent('empty_basket'));
      expect(wrapper.find('strong.invalid-feedback').text()).toMatchSnapshot();
    });

    it('should display already_applied_voucher errors correctly', () => {
      const wrapper = mount(createComponent('already_applied_voucher'));
      expect(wrapper.find('strong.invalid-feedback').text()).toMatchSnapshot();
    });

    it('should display code_does_not_exist errors correctly', () => {
      const wrapper = mount(createComponent('code_does_not_exist'));
      expect(wrapper.find('strong.invalid-feedback').text()).toMatchSnapshot();
    });

    it('should display code_expired errors correctly', () => {
      const wrapper = mount(createComponent('code_expired'));
      expect(wrapper.find('strong.invalid-feedback').text()).toMatchSnapshot();
    });

    it('should display code_not_active errors correctly', () => {
      const wrapper = mount(createComponent('code_not_active'));
      expect(wrapper.find('strong.invalid-feedback').text()).toMatchSnapshot();
    });

    it('should display code_not_available errors correctly', () => {
      const wrapper = mount(createComponent('code_not_available'));
      expect(wrapper.find('strong.invalid-feedback').text()).toMatchSnapshot();
    });

    it('should display code_not_valid errors correctly', () => {
      const wrapper = mount(createComponent('code_not_valid'));
      expect(wrapper.find('strong.invalid-feedback').text()).toMatchSnapshot();
    });

    it('should display unknown errors correctly', () => {
      const wrapper = mount(createComponent('some_other_error'));
      expect(wrapper.find('strong.invalid-feedback').text()).toMatchSnapshot();
    });
  });
});
