/* eslint-disable global-require */
import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';
import ApplePayButton from './ApplePayButton';
import { configuration } from '../../../environment';
import messages from '../../../i18n';

// Mock language cookie
Object.defineProperty(global.document, 'cookie', {
  writable: true,
  value: `${configuration.LANGUAGE_PREFERENCE_COOKIE_NAME}=en`,
});

configureI18n(configuration, messages);


const applePaySession = { begin: jest.fn() };
global.ApplePaySession = jest.fn().mockImplementation(() => applePaySession);
global.ApplePaySession.canMakePayments = () => true;

jest.mock('@edx/frontend-analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

jest.mock('@edx/frontend-logging', () => ({
  logError: jest.fn(),
}));

// import { logError } from '@edx/frontend-logging'; // eslint-disable-line import/first


// describe('<ApplePayButton />', () => {
//   it('should render properly', () => {
//     const tree = renderer
//       .create((
//         <IntlProvider locale="en">
//           <ApplePayButton
//             lang="en"
//             title="Pay with Apple Pay"
//           />
//         </IntlProvider>
//       ))
//       .toJSON();

//     expect(tree).toMatchSnapshot();
//   });
// });
describe('<ApplePayButton />', () => {
  it('should render properly', () => {
    const tree = renderer
      .create(<ApplePayButton totalAmount={10} lang="en" title="Pay with Apple Pay" />)
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should perform an apple pay transaction on click', () => {
    const component = <ApplePayButton totalAmount={10} lang="en" title="Pay with Apple Pay" />;
    const wrapper = mount(component);
    analytics.sendTrackEvent = jest.fn();
    const eventName = 'edx.bi.ecommerce.basket.payment_selected';
    const eventProps = {
      type: 'click',
      category: 'checkout',
      paymentMethod: 'Apple Pay',
    };
    wrapper.find('button').simulate('click');
    expect(analytics.sendTrackEvent).toHaveBeenCalledWith(eventName, eventProps);
    expect(performApplePayPayment).toHaveBeenCalledWith({
      totalAmount: 10,
      onPaymentBegin: wrapper.prop('onPaymentBegin'),
      onPaymentComplete: wrapper.prop('onPaymentComplete'),
      onMerchantValidationFailure: wrapper.prop('onMerchantValidationFailure'),
      onPaymentAuthorizationFailure: wrapper.prop('onPaymentAuthorizationFailure'),
      onPaymentCancel: wrapper.prop('onPaymentCancel'),
    });
  });

  it('should bail if it cannot submit for some reason', () => {
    const component = <ApplePayButton lang="en" title="Pay with Apple Pay" />;
    const wrapper = mount(component);
    analytics.sendTrackEvent = jest.fn();

    performApplePayPayment.mockClear();

    wrapper.find('button').simulate('click');

    expect(analytics.sendTrackEvent).not.toHaveBeenCalled();
    expect(performApplePayPayment).not.toHaveBeenCalled();
  });

  describe('with exploding ApplePaySession canMakePayments', () => {
    let error;

    beforeEach(() => {
      error = new Error();
      global.ApplePaySession.canMakePayments = () => {
        throw error;
      };
    });

    afterEach(() => {
      global.ApplePaySession.canMakePayments = () => true;
    });

    it('should log an error if it catches one in constructor', () => {
      const component = <ApplePayButton lang="en" title="Pay with Apple Pay" />;

      mount(component);

      expect(logError).toHaveBeenCalledWith(error);
    });
  });
});
