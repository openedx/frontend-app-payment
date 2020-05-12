import 'babel-polyfill';

import axios from 'axios';
import {
  initialize,
  APP_INIT_ERROR,
  APP_READY,
  APP_AUTH_INITIALIZED,
  mergeConfig,
  subscribe,
} from '@edx/frontend-platform';
import { ErrorPage, AppProvider } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
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
import sendRev1074Event from './payment/sendRev1074Event';
import configureStore from './data/configureStore';

import './index.scss';
import './assets/favicon.ico';

const tempHttpClient = axios.create();
tempHttpClient.defaults.withCredentials = true;

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
});

subscribe(APP_READY, () => {
  markPerformanceIfAble('Payment app began painting');
  sendTrackEvent(
    'edx.bi.ecommerce.payment_mfe.started_painting',
    getPerformanceProperties(),
  );
  sendRev1074Event('payment_mfe.started_painting', {}, true);

  ReactDOM.render(
    <AppProvider store={configureStore()}>
      <Header />
      <main>
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
  ],
  requireAuthenticatedUser: true,
  hydrateAuthenticatedUser: true,
});
