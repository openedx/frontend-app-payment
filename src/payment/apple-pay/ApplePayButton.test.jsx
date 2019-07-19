/* eslint-disable global-require */
import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import analytics from '@edx/frontend-analytics';
import ApplePayButton from './ApplePayButton';

// import * as analytics from '@edx/frontend-analytics';

const applePaySession = { begin: jest.fn() };
global.ApplePaySession = jest.fn().mockImplementation(() => applePaySession);
global.ApplePaySession.canMakePayments = () => true;

jest.mock('@edx/frontend-analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

describe('<ApplePayButton />', () => {
  it('should render properly', () => {
    const tree = renderer
      .create((
        <ApplePayButton
          totalAmount={10}
          lang="en"
          title="Pay with Apple Pay"
        />
      ))
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should perform an apple pay transaction on click', () => {
    const wrapper = mount((
      <ApplePayButton
        totalAmount={10}
        lang="en"
        title="Pay with Apple Pay"
      />
    ));
    analytics.sendTrackEvent = jest.fn();
    const eventName = 'edx.bi.ecommerce.basket.payment_selected';
    const eventProps = {
      type: 'click',
      category: 'checkout',
      paymentMethod: 'Apple Pay',
    };
    wrapper.find('button').simulate('click');
    expect(applePaySession.begin).toHaveBeenCalled();
    expect(analytics.sendTrackEvent).toHaveBeenCalledWith(eventName, eventProps);
  });
});
