import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
// import { IntlProvider } from '@edx/frontend-platform/i18n';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-platform/i18n';

// import * as analytics from '@edx/frontend-platform/analytics';
import Cookies from 'universal-cookie';
/* eslint-disable import/no-extraneous-dependencies */
import { Factory } from 'rosie';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
// import '@testing-library/jest-dom/extend-expect';

import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { getConfig } from '@edx/frontend-platform';
import { Provider } from 'react-redux';

import { AppContext } from '@edx/frontend-platform/react';
// import './__factories__/subscription.factory';
import '../payment/__factories__/userAccount.factory';
import createRootReducer from '../data/reducers';

// now everything should be imported from our test-util
// import { render, fireEvent } from '../test-utils';
/**
 * TODO: whoever update the react version
 * please also update react-testing-library version too
 * */

const config = getConfig();
const locale = 'en';

// Mock the logError function
jest.mock('@edx/frontend-platform/logging', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

configureI18n({
  config: {
    ENVIRONMENT: process.env.ENVIRONMENT,
    LANGUAGE_PREFERENCE_COOKIE_NAME: process.env.LANGUAGE_PREFERENCE_COOKIE_NAME,
  },
  loggingService: {
    logError: jest.fn(),
    logInfo: jest.fn(),
  },
  messages: {
    uk: {},
    th: {},
    ru: {},
    'pt-br': {},
    pl: {},
    'ko-kr': {},
    id: {},
    he: {},
    ca: {},
    'zh-cn': {},
    fr: {},
    'es-419': {},
    ar: {},
    fa: {},
    'fa-ir': {},
  },
});

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
  sendPageEvent: jest.fn(),
}));

// // https://github.com/wwayne/react-tooltip/issues/595#issuecomment-638438372
jest.mock('react-tooltip/node_modules/uuid', () => ({
  v4: () => '00000000-0000-0000-0000-000000000000',
}));

const store = createStore(createRootReducer(), {}, applyMiddleware(thunkMiddleware));

const AllTheProviders = ({ children }) => {
  const authenticatedUser = Factory.build('userAccount');
  const appContext = useMemo(() => ({ authenticatedUser, config, locale }), [authenticatedUser]);
  // analytics.sendTrackingLogEvent = jest.fn();
  return (
    <IntlProvider locale="en">
      <AppContext.Provider value={appContext}>
        <Provider store={store}>
          {children}
        </Provider>
      </AppContext.Provider>
    </IntlProvider>
  );
};

AllTheProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

const customRender = (ui, options) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
// eslint-disable-next-line import/no-extraneous-dependencies
export * from '@testing-library/react';

// override render method
export {
  customRender as render,
  store,
  config,
  locale,
  Cookies,
};
