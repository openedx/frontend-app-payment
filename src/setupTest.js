/* eslint-disable import/no-extraneous-dependencies */
import 'babel-polyfill';

import { App } from '@edx/frontend-base';
import { configure as configureI18n } from '@edx/frontend-i18n';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import messages from './i18n';

Enzyme.configure({ adapter: new Adapter() });

// These configuration values are usually set in webpack's EnvironmentPlugin however
// Jest does not use webpack so we need to set these so for testing
process.env.LMS_BASE_URL = 'http://localhost:18000';
process.env.SUPPORT_URL = 'http://localhost:18000/support';
process.env.LANGUAGE_PREFERENCE_COOKIE_NAME = 'language-cookie';
process.env.ECOMMERCE_BASE_URL = 'http://localhost:18130';

configureI18n(App.config, messages);
