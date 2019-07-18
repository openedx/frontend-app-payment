/* eslint-disable global-require */
import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';

import ApplePayButton from './ApplePayButton';


const applePaySession = { begin: jest.fn() };
global.ApplePaySession = jest.fn().mockImplementation(() => applePaySession);
global.ApplePaySession.canMakePayments = () => true;


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

    wrapper.find('button').simulate('click');
    expect(applePaySession.begin).toHaveBeenCalled();
  });
});
