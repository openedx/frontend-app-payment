import 'babel-polyfill';

import { App, AppProvider, APP_ERROR, APP_READY, ErrorPage, APP_AUTHENTICATED } from '@edx/frontend-base';
import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import Header, { messages as headerMessages } from '@edx/frontend-component-header';
import Footer, { messages as footerMessages } from '@edx/frontend-component-footer';

import appMessages from './i18n';
import { PaymentPage, EcommerceRedirect, responseInterceptor } from './payment';
import configureStore from './store';
import markPerformanceIfAble from './speedcurve';
import './index.scss';

App.subscribe(APP_READY, () => {
  markPerformanceIfAble('Payment app began painting');
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
