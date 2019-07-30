import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  identifyAuthenticatedUser,
  sendPageEvent,
  configureAnalytics,
  initializeSegment,
} from '@edx/frontend-analytics';
import { configureLoggingService, NewRelicLoggingService } from '@edx/frontend-logging';
import { getAuthenticatedAPIClient } from '@edx/frontend-auth';
import { configure as configureI18n } from '@edx/frontend-i18n';

import { configuration } from './environment';
import messages from './i18n';
import configureStore from './store';
import { configureUserAccountApiService } from './common';
import { configureApiService as configurePaymentApiService } from './payment';

import './index.scss';
import App from './components/App';
import ErrorPage from './common/components/ErrorPage';

let apiClient = null;

/**
 * We need to merge the application configuration with the authentication state
 * so that we can hand it all to the redux store's initializer.
 */
function createInitialState() {
  const authenticationState = apiClient.getAuthenticationState();
  if (Object.keys(authenticationState).length === 0) {
    throw new Error('Empty authentication state returned from gettAuthenticationState()');
  }
  return Object.assign({}, { configuration }, authenticationState);
}

function configure() {
  configureI18n(configuration, messages);

  const { store, history } = configureStore(createInitialState(), configuration.ENVIRONMENT);

  configureLoggingService(NewRelicLoggingService);
  configurePaymentApiService(configuration, apiClient);
  configureUserAccountApiService(configuration, apiClient);
  initializeSegment(configuration.SEGMENT_KEY);
  configureAnalytics({
    loggingService: NewRelicLoggingService,
    authApiClient: apiClient,
    analyticsApiBaseUrl: configuration.LMS_BASE_URL,
  });

  return {
    store,
    history,
  };
}

function initialize(accessToken) {
  const { store, history } = configure();

  if (accessToken) {
    ReactDOM.render(<App store={store} history={history} />, document.getElementById('root'));
    identifyAuthenticatedUser(accessToken.userId);
    sendPageEvent();
  } else {
    // This should never happen, but it does sometimes.
    // Add logging to learn more.
    throw new Error('Empty accessToken returned from ensurePublicOrAuthenticationAndCookies callback.');
  }
}

try {
  if (configuration.ENVIRONMENT !== 'production') {
    import(/* webpackChunkName: "react-axe" */ 'react-axe').then(({ default: axe }) =>
      axe(React, ReactDOM, 1000));
  }

  apiClient = getAuthenticatedAPIClient({
    appBaseUrl: configuration.BASE_URL,
    authBaseUrl: configuration.LMS_BASE_URL,
    loginUrl: configuration.LOGIN_URL,
    logoutUrl: configuration.LOGOUT_URL,
    csrfTokenApiPath: configuration.CSRF_TOKEN_API_PATH,
    refreshAccessTokenEndpoint: configuration.REFRESH_ACCESS_TOKEN_ENDPOINT,
    accessTokenCookieName: configuration.ACCESS_TOKEN_COOKIE_NAME,
    userInfoCookieName: configuration.USER_INFO_COOKIE_NAME,
    csrfCookieName: configuration.CSRF_COOKIE_NAME,
    loggingService: NewRelicLoggingService,
  });

  apiClient.ensurePublicOrAuthenticationAndCookies(window.location.pathname, initialize);
} catch (e) {
  ReactDOM.render(<ErrorPage />, document.getElementById('root'));
  NewRelicLoggingService.logError(e.message);
}
