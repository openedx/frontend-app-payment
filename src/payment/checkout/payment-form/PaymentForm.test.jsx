/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { SubmissionError } from 'redux-form';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-platform/i18n';
import { Factory } from 'rosie';
import configureMockStore from 'redux-mock-store';

import { AppContext } from '@edx/frontend-platform/react';
import { fireEvent, render, screen } from '@testing-library/react';
import PaymentForm from './PaymentForm';
import * as formValidators from './utils/form-validators';
import createRootReducer from '../../../data/reducers';
import '../../__factories__/userAccount.factory';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

const validateRequiredFieldsMock = jest.spyOn(formValidators, 'validateRequiredFields');
const validateCardDetailsMock = jest.spyOn(formValidators, 'validateCardDetails');

const mockStore = configureMockStore();

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
  },
});

const authenticatedUser = Factory.build('userAccount');

describe('<PaymentForm />', () => {
  let paymentForm;
  let store;
  let wrapper;

  beforeEach(() => {
    store = createStore(createRootReducer(), {});

    wrapper = render((
      <IntlProvider locale="en">
        <AppContext.Provider value={{ authenticatedUser }}>
          <Provider store={store}>
            <PaymentForm
              handleSubmit={() => {}}
              onSubmitPayment={() => {}}
              onSubmitButtonClick={() => {}}
            />
          </Provider>
        </AppContext.Provider>
      </IntlProvider>
    ));
    paymentForm = screen.getByTestId('payment-form');
  });

  afterEach(() => {
    formValidators.validateRequiredFields({});
    formValidators.validateCardDetails({});
  });

  describe('getRequiredFields', () => {
    it('returns expected required fields', () => {
      const testFormValues = [
        {
          firstName: '',
          lastName: '',
          address: '',
          city: '',
          country: 'GB',
          cardExpirationMonth: '',
          cardExpirationYear: '',
          optionalField: '',
        },
        {
          firstName: '',
          lastName: '',
          address: '',
          city: '',
          country: 'CA',
          cardExpirationMonth: '',
          cardExpirationYear: '',
          optionalField: '',
        },
        {
          firstName: '',
          lastName: '',
          address: '',
          city: '',
          country: 'US',
          cardExpirationMonth: '',
          cardExpirationYear: '',
          optionalField: '',
        },
      ];

      testFormValues.forEach((formValues) => {
        const requiredFields = formValidators.getRequiredFields(formValues);
        if (formValues.country) {
          const { optionalField, ...expectedRequiredFields } = formValues;
          expect(requiredFields).toEqual(expectedRequiredFields);
        } else {
          const { state, optionalField, ...expectedRequiredFields } = formValues;
          expect(requiredFields).toEqual(expectedRequiredFields);
        }
      });
    });

    it('returns organization fields for a bulk order', () => {
      const isBulkOrder = true;
      render((
        <IntlProvider locale="en">
          <AppContext.Provider value={{ authenticatedUser }}>
            <Provider store={store}>
              <PaymentForm
                isBulkOrder
                handleSubmit={() => {}}
                onSubmitPayment={() => {}}
                onSubmitButtonClick={() => {}}
              />
            </Provider>
          </AppContext.Provider>
        </IntlProvider>
      ));

      const formValues = {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        country: 'UK',
        cardNumber: '',
        securityCode: '',
        cardExpirationMonth: '',
        cardExpirationYear: '',
        optionalField: '',
        organization: 'edx',
      };

      const requiredFields = formValidators.getRequiredFields(formValues, isBulkOrder);
      expect(formValues.organization).toEqual(requiredFields.organization);
    });
  });
  describe('onSubmit', () => {
    it('throws expected errors', () => {
      const testFormValues = {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        country: '',
        cardExpirationMonth: '',
        cardExpirationYear: '',
      };
      const testData = [
        [
          { firstName: 'This field is required', cardNumber: 'This field is required' },
          { cardNumber: 'Card invalid' },
          new SubmissionError({
            firstName: 'This field is required',
            cardNumber: 'Card invalid',
          }),
        ],
        [
          {},
          {},
          null,
        ],
      ];

      testData.forEach((testCaseData) => {
        validateRequiredFieldsMock.mockReturnValueOnce(testCaseData[0]);
        validateCardDetailsMock.mockReturnValueOnce(testCaseData[1]);
        if (testCaseData[2]) {
          expect(() => fireEvent.submit(paymentForm, (testFormValues)).toThrow(testCaseData[2]));
        } else {
          expect(() => fireEvent.submit(paymentForm, testFormValues)).not.toThrow();
        }
      });
    });
  });
  describe('validateCardDetails', () => {
    it('returns expected errors', () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const testData = [
        ['', '', {}],
        [`${currentMonth - 1}`, `${currentYear}`, { cardExpirationMonth: 'payment.form.errors.card.expired' }],
      ];

      testData.forEach((testCaseData) => {
        expect(formValidators.validateCardDetails(
          testCaseData[0],
          testCaseData[1],
        )).toEqual(testCaseData[2]);
      });
    });
  });
  describe('validateRequiredFields', () => {
    it('returns errors if values are empty', () => {
      const values = {
        firsName: 'Jane',
        lastName: undefined,
      };
      const expectedErrors = {
        lastName: 'payment.form.errors.required.field',
      };
      expect(formValidators.validateRequiredFields(values)).toEqual(expectedErrors);
    });
  });
  describe('focusFirstError', () => {
    it('focuses on the input name of the first error', () => {
      wrapper = render((
        <IntlProvider locale="en">
          <AppContext.Provider value={{ authenticatedUser }}>
            <Provider store={mockStore({
              form: {
                payment: {
                  submitErrors: { firstName: 'error' },
                },
              },
            })}
            >
              <PaymentForm
                onSubmitPayment={() => {}}
                onSubmitButtonClick={() => {}}
              />
            </Provider>
          </AppContext.Provider>
        </IntlProvider>
      ));
      paymentForm = screen.getAllByTestId('payment-form');
      const firstNameField = wrapper.container.querySelector('#firstName');
      firstNameField.focus = jest.fn();
      fireEvent.submit(paymentForm[1]);
      expect(firstNameField.focus).toHaveBeenCalled();
    });
  });
});
