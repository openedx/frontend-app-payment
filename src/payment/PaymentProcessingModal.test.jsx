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
import { PAYMENT_STATE } from './data/constants';

const basketStoreGenerator = (paymentState = PAYMENT_STATE.DEFAULT, keepPolling = false) => (
  {
    payment: {
      basket: {
        loading: true,
        loaded: false,
        submitting: false,
        redirect: false,
        isBasketProcessing: false,
        products: [{ sku: '00000' }],
        enableStripePaymentProcessor: true,
        /** Modified by both getActiveOrder and paymentStatePolling */
        // eslint-disable-next-line object-shorthand
        paymentState: paymentState,
        /** state specific to paymentStatePolling */
        paymentStatePolling: {
          // eslint-disable-next-line object-shorthand
          keepPolling: keepPolling, // TODO: GRM: FIX both debugging items (this is one)
          counter: 5, // debugging
        },
      },
      clientSecret: { isClientSecretProcessing: false, clientSecretId: '' },
    },
    feedback: { byId: {}, orderedIds: [] },
    form: {},
  }
);

const shouldPoll = (payState) => payState === PAYMENT_STATE.PENDING || payState === PAYMENT_STATE.PROCESSING;

const buildDescription = (tp) => `is ${shouldPoll(tp.status) ? '' : 'NOT '}shown (status == '${tp.status}')`;

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

  /* eslint-disable no-multi-spaces */
  const tests = [
    { expect: true,  status: PAYMENT_STATE.PROCESSING },
    { expect: true,  status: PAYMENT_STATE.PENDING    },
    { expect: false, status: PAYMENT_STATE.FAILED     },
    { expect: false, status: PAYMENT_STATE.DEFAULT    },
    { expect: false, status: PAYMENT_STATE.CHECKOUT   },
    { expect: false, status: PAYMENT_STATE.COMPLETED  },
  ];
  /* eslint-enable no-multi-spaces */

  for (let i = 0, testPlan = tests[i]; i < tests.length; i++, testPlan = tests[i]) {
    describe(buildDescription(testPlan), () => {
      it(`${shouldPoll(testPlan.status) ? 'renders a dialog' : 'does not render a dialog'}`, () => {
        const mockStore = configureMockStore();
        const store = mockStore(basketStoreGenerator(testPlan.status, shouldPoll(testPlan.status)));

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
