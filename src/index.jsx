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
import getQueryParameters from './data/getQueryParameters';
import { configureApiService as configurePaymentApiService } from './payment';

import './index.scss';
import App from './components/App';
import ErrorPage from './common/components/ErrorPage';

let apiClient = null;

/**
 * We need to merge the application configuration with the authentication state
 * so that we can hand it all to the redux store's initializer.
 */
function createInitialState(authenticatedUser) {
  const queryParameters = getQueryParameters();
  const authenicationState = { authentication: authenticatedUser };
  return Object.assign({}, { configuration, queryParameters }, authenicationState);
}

function configure(authenticatedUser) {
  configureI18n(configuration, messages);

  const { store, history } = configureStore(createInitialState(authenticatedUser), configuration.ENVIRONMENT);

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

function initialize(authenticatedUser) {
  const { store, history } = configure(authenticatedUser);

  ReactDOM.render(<App store={store} history={history} />, document.getElementById('root'));
  identifyAuthenticatedUser(authenticatedUser.userId);
  sendPageEvent();
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

  apiClient.ensureAuthenticatedUser(window.location.pathname)
    .then(({ authenticatedUser }) => {
      initialize(authenticatedUser);
    });
} catch (e) {
  ReactDOM.render(<ErrorPage />, document.getElementById('root'));
  NewRelicLoggingService.logError(e.message);
}
