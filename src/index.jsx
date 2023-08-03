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
} from '@edx/frontend-platform';
import { ErrorPage, AppProvider } from '@edx/frontend-platform/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Routes } from 'react-router-dom';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { getLoggingService, logError } from '@edx/frontend-platform/logging';
import Header from '@edx/frontend-component-header';
import Footer from '@edx/frontend-component-footer';

import { configure as configureI18n } from '@edx/frontend-platform/i18n/lib';
import { getLocale } from '@edx/frontend-platform/i18n';
import messages from './i18n';

import {
  PaymentPage,
  EcommerceRedirect,
  responseInterceptor,
  markPerformanceIfAble,
  getPerformanceProperties,
} from './payment';
import { SubscriptionPage } from './subscription';
import { Secure3dRedirectPage } from './subscription/secure-3d/Secure3dRedirectPage';
import configureStore from './data/configureStore';

import './index.scss';
import { processUrlWaffleFlags, waffleInterceptor } from './data/waffleFlags';

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
  WAFFLE_FLAGS: {
    ...processUrlWaffleFlags(`env://?${process.env.WAFFLE_FLAGS}`),
    ...processUrlWaffleFlags(),
  },
  STRIPE_RESPONSE_URL: process.env.STRIPE_RESPONSE_URL,
  STRIPE_DEFERRED_INTENT_BETA_FLAG: process.env.STRIPE_DEFERRED_INTENT_BETA_FLAG,
  SUBSCRIPTIONS_BASE_URL: process.env.SUBSCRIPTIONS_BASE_URL,
  ENABLE_B2C_SUBSCRIPTIONS: process.env.ENABLE_B2C_SUBSCRIPTIONS,
  SUBSCRIPTIONS_LEARNER_HELP_CENTER_URL: process.env.SUBSCRIPTIONS_LEARNER_HELP_CENTER_URL,
  COMMERCE_COORDINATOR_BASE_URL: process.env.COMMERCE_COORDINATOR_BASE_URL,
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
        <Routes>
          <Route path="/" element={<PaymentPage />} />
          {
            getConfig().ENABLE_B2C_SUBSCRIPTIONS?.toLowerCase() === 'true' ? (
              <>
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/subscription/3ds" element={<Secure3dRedirectPage />} />
              </>
            ) : null
          }
          <Route path="*" element={<EcommerceRedirect />} />
        </Routes>
      </main>
      <Footer />
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  try {
    getLocale('en');
  } catch (e) {
    configureI18n({
      messages: {},
      config: getConfig(),
      loggingService: getLoggingService(),
    });
  }
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

subscribe(APP_AUTH_INITIALIZED, () => {
  getAuthenticatedHttpClient().interceptors.response.use(responseInterceptor);

  getAuthenticatedHttpClient().interceptors.request.use(waffleInterceptor);

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
  messages,
  requireAuthenticatedUser: true,
  hydrateAuthenticatedUser: true,
});
