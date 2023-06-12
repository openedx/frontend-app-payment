/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable global-require */
// noinspection DuplicatedCode

import { mount } from 'enzyme';
import { configure as configureI18n } from '@edx/frontend-platform/i18n/lib';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import React from 'react';
import { PaymentProcessingModal } from './PaymentProcessingModal';

const basketStoreGenerator = (isProcessing) => (
  {
    payment: {
      basket: {
        loading: true,
        loaded: false,
        submitting: false,
        redirect: false,
        isBasketProcessing: isProcessing,
        products: [{ sku: '00000' }],
        enableStripePaymentProcessor: true,
      },
      clientSecret: { isClientSecretProcessing: false, clientSecretId: '' },
    },
    feedback: { byId: {}, orderedIds: [] },
    form: {},
  }
);

const statusStringToBool = (str) => str === 'pending';

const buildDescription = (tp) => `is ${statusStringToBool(tp.status) ? '' : 'NOT '}shown (status == '${tp.status}')`;

/**
 * PaymentProcessingModal Test
 */
describe('<PaymentProcessingModal />', () => {
  // eslint-disable-next-line no-console
  console.log('We expect a gapMode warning... its not unusual and is in a framework.');

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

  const tests = [
    { expect: true, status: 'pending' },
    { expect: false, status: 'failed' },
    { expect: false, status: 'draft' },
    { expect: false, status: 'checkout' },
  ];

  for (let i = 0, testPlan = tests[i]; i < tests.length; i++, testPlan = tests[i]) {
    describe(buildDescription(testPlan), () => {
      it(`${statusStringToBool(testPlan.status) ? 'renders a dialog' : 'does not render a dialog'}`, () => {
        const mockStore = configureMockStore();
        const store = mockStore(basketStoreGenerator(statusStringToBool(testPlan.status)));

        const wrapper = mount((
          <IntlProvider locale="en">
            <Provider store={store}>
              <PaymentProcessingModal />
            </Provider>
          </IntlProvider>
        ));

        expect(wrapper.exists('div[role="dialog"]')).toBe(testPlan.expect);
      });
    });
  }
});
