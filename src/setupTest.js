/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import '@testing-library/jest-dom';
import { mergeConfig } from '@edx/frontend-platform';
import { processUrlWaffleFlags } from './data/waffleFlags';

mergeConfig({
  // Let's adopt the whole of the test env file.
  ...process.env,

  // And modify what needs extra processing/parsing.
  APPLE_PAY_SUPPORTED_NETWORKS: process.env.APPLE_PAY_SUPPORTED_NETWORKS && process.env.APPLE_PAY_SUPPORTED_NETWORKS.split(','),
  APPLE_PAY_MERCHANT_CAPABILITIES: process.env.APPLE_PAY_MERCHANT_CAPABILITIES && process.env.APPLE_PAY_MERCHANT_CAPABILITIES.split(','),
  WAFFLE_FLAGS: processUrlWaffleFlags(`env://?${process.env.WAFFLE_FLAGS}`),
});
