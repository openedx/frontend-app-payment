import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { getConfig } from '@edx/frontend-platform';

import ApplePayButton from './ApplePayButton';

// Mock language cookie
Object.defineProperty(global.document, 'cookie', {
  writable: true,
  value: `${getConfig().LANGUAGE_PREFERENCE_COOKIE_NAME}=en`,
});

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

const applePaySession = { begin: jest.fn() };
global.ApplePaySession = jest.fn().mockImplementation(() => applePaySession);
global.ApplePaySession.canMakePayments = () => true;

describe('<ApplePayButton />', () => {
  it('should render properly', () => {
    const tree = renderer
      .create((
        <IntlProvider locale="en">
          <ApplePayButton />
        </IntlProvider>
      ))
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should call an onClick handler if it is supplied', () => {
    const clickHandler = jest.fn();
    const wrapper = mount((
      <IntlProvider locale="en">
        <ApplePayButton onClick={clickHandler} />
      </IntlProvider>
    ));

    wrapper.find('ApplePayButton').simulate('click');
    expect(clickHandler).toHaveBeenCalled();
  });

  it('should not call an onClick handler if it is disabled', () => {
    const clickHandler = jest.fn();
    const wrapper = mount((
      <IntlProvider locale="en">
        <ApplePayButton onClick={clickHandler} disabled />
      </IntlProvider>
    ));

    wrapper.find('ApplePayButton').simulate('click');
    expect(clickHandler).not.toHaveBeenCalled();
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
      mount((
        <IntlProvider locale="en">
          <ApplePayButton />
        </IntlProvider>
      ));
      expect(logError).toHaveBeenCalledWith(error);
    });
  });
});
