/* eslint-disable import/no-extraneous-dependencies */
import 'babel-polyfill';

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { mergeConfig } from '@edx/frontend-platform';

Enzyme.configure({ adapter: new Adapter() });

mergeConfig({
  CURRENCY_COOKIE_NAME: process.env.CURRENCY_COOKIE_NAME,
  SUPPORT_URL: process.env.SUPPORT_URL,
  CYBERSOURCE_URL: process.env.CYBERSOURCE_URL,
  APPLE_PAY_MERCHANT_NAME: process.env.APPLE_PAY_MERCHANT_NAME,
  APPLE_PAY_COUNTRY_CODE: process.env.APPLE_PAY_COUNTRY_CODE,
  APPLE_PAY_CURRENCY_CODE: process.env.APPLE_PAY_CURRENCY_CODE,
  APPLE_PAY_START_SESSION_URL: process.env.APPLE_PAY_START_SESSION_URL,
  APPLE_PAY_AUTHORIZE_URL: process.env.APPLE_PAY_AUTHORIZE_URL,
  APPLE_PAY_SUPPORTED_NETWORKS: process.env.APPLE_PAY_SUPPORTED_NETWORKS && process.env.APPLE_PAY_SUPPORTED_NETWORKS.split(','),
  APPLE_PAY_MERCHANT_CAPABILITIES: process.env.APPLE_PAY_MERCHANT_CAPABILITIES && process.env.APPLE_PAY_MERCHANT_CAPABILITIES.split(','),
  WAFFLE_FLAGS: {},
});
