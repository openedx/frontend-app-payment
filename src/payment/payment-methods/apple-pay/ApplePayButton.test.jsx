/* eslint-disable global-require */
import React from 'react';
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
});
