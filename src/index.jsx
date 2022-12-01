import 'core-js/stable';
import 'regenerator-runtime/runtime';

import axios from 'axios';
import {
  initialize,
  APP_INIT_ERROR,
  APP_READY,
  APP_AUTH_INITIALIZED,
  mergeConfig,
  getConfig,
  subscribe,
  getQueryParameters,
} from '@edx/frontend-platform';
import { ErrorPage, AppProvider } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { messages as paragonMessages } from '@edx/paragon';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { logError } from '@edx/frontend-platform/logging';
import Header, { messages as headerMessages } from '@edx/frontend-component-header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import {
  PaymentPage, EcommerceRedirect, responseInterceptor, markPerformanceIfAble, getPerformanceProperties,
} from './payment';
import configureStore from './data/configureStore';

import './index.scss';

const tempHttpClient = axios.create();
tempHttpClient.defaults.withCredentials = true;

const allQueryParams = getQueryParameters(global.location.search);
const waffleFlags = {};
const WAFFLE_PREFIX = 'dwft_';
Object.keys(allQueryParams).forEach((param) => {
  if (param.startsWith(WAFFLE_PREFIX)) {
    const truth = /^\s*(true|t|1|on)\s*$/i;
    const configKey = param.substring(WAFFLE_PREFIX.length, param.length);
    waffleFlags[configKey] = truth.test(allQueryParams[param]);
  }
});
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
  WAFFLE_FLAGS: waffleFlags,
});

subscribe(APP_READY, () => {
  if (process.env.NODE_ENV === 'development') {
    global.analytics.debug();
  }
  markPerformanceIfAble('Payment app began painting');
  sendTrackEvent(
    'edx.bi.ecommerce.payment_mfe.started_painting',
    getPerformanceProperties(),
  );

  ReactDOM.render(
    <AppProvider store={configureStore()}>
      <Header />
      <main id="main">
        <Switch>
          <Route exact path="/" component={PaymentPage} />
          <Route path="*" component={EcommerceRedirect} />
        </Switch>
      </main>
      <Footer />
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

subscribe(APP_AUTH_INITIALIZED, () => {
  getAuthenticatedHttpClient().interceptors.response.use(responseInterceptor);

  getAuthenticatedHttpClient().interceptors.request.use(async (requestConfig) => {
    const params = requestConfig.params || {};
    const curWaffleFlags = getConfig().WAFFLE_FLAGS;
    Object.keys(curWaffleFlags).forEach((key) => {
      const fullKey = encodeURIComponent(WAFFLE_PREFIX + key);
      const value = curWaffleFlags[key] ? '1' : '0';
      params[fullKey] = value;
    });
    requestConfig.params = params; // eslint-disable-line no-param-reassign
    return requestConfig;
  });

  // Temporary fix for ARCH-1304
  // Force refresh the jwt cookie before any post request.
  // This should be unnecessary but some requests are failing
  // with a JWT expired error on the server. This ensures
  // that the jwt cookie sent to the server for any post request
  // is brand new and therefore less likely to have any timing
  // problems.
  getAuthenticatedHttpClient().interceptors.request.use(async (requestConfig) => {
    if (requestConfig.method === 'post') {
      try {
        await tempHttpClient.post(process.env.REFRESH_ACCESS_TOKEN_ENDPOINT);
      } catch (e) {
        logError(new Error('There was a failure to force refresh the jwt token. (In temporary fix for ARCH-1304)'));
      }
    }

    return requestConfig;
  });
});

initialize({
  messages: [
    appMessages,
    headerMessages,
    footerMessages,
    paragonMessages,
  ],
  requireAuthenticatedUser: true,
  hydrateAuthenticatedUser: true,
});
