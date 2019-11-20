import 'babel-polyfill';

import { App, AppProvider, APP_ERROR, APP_READY, ErrorPage, APP_AUTHENTICATED } from '@edx/frontend-base';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import { sendTrackEvent } from '@edx/frontend-analytics';
import { logError } from '@edx/frontend-logging';
import Header, { messages as headerMessages } from '@edx/frontend-component-header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import { PaymentPage, EcommerceRedirect, responseInterceptor, markPerformanceIfAble, getPerformanceProperties } from './payment';
import configureStore from './data/configureStore';

import './index.scss';
import './assets/favicon.ico';

App.subscribe(APP_READY, () => {
  markPerformanceIfAble('Payment app began painting');
  sendTrackEvent(
    'edx.bi.ecommerce.payment_mfe.started_painting',
    getPerformanceProperties(),
  );
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

App.subscribe(APP_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

App.subscribe(APP_AUTHENTICATED, () => {
  App.apiClient.interceptors.response.use(responseInterceptor);

  // Temporary fix for ARCH-1304
  // Force refresh the jwt cookie before any post request.
  // This should be unnecessary but some requests are failing
  // with a JWT expired error on the server. This ensures
  // that the jwt cookie sent to the server for any post request
  // is brand new and therefore less likely to have any timing
  // problems.
  App.apiClient.interceptors.request.use(async (requestConfig) => {
    if (requestConfig.method === 'post') {
      try {
        await fetch(process.env.REFRESH_ACCESS_TOKEN_ENDPOINT, { method: 'POST' });
      } catch (e) {
        logError(new Error('There was a failure to force refresh the jwt token. (In temporary fix for ARCH-1304)'));
      }
    }

    return requestConfig;
  });
});

App.initialize({
  messages: [
    appMessages,
    headerMessages,
    footerMessages,
  ],
  overrideHandlers: {
    loadConfig: (app) => {
      App.mergeConfig({
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
      }, 'App loadConfig override handler')
    }
  }
});
