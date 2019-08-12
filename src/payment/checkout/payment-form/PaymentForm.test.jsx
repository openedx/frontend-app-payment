/* eslint-disable global-require */
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { mount } from 'enzyme';
import { SubmissionError } from 'redux-form';
import { IntlProvider, configure as configureI18n } from '@edx/frontend-i18n';
import analytics from '@edx/frontend-analytics';

import { configuration } from '../../../environment';
import messages from '../../../i18n';
import PaymentForm, { PaymentFormComponent } from './PaymentForm';

const mockStore = configureMockStore();
const storeMocks = {
  defaultState: require('../../__mocks__/defaultState.mockStore.js'), // eslint-disable-line global-require
};

configureI18n(configuration, messages);

jest.mock('@edx/frontend-analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

describe('<PaymentForm />', () => {
  let paymentForm;
  beforeEach(() => {
    const wrapper = mount((
      <IntlProvider locale="en">
        <Provider store={mockStore(storeMocks.defaultState)}>
          <PaymentForm handleSubmit={() => {}} />
        </Provider>
      </IntlProvider>
    ));
    paymentForm = wrapper.find(PaymentFormComponent).first().instance();
  });
  describe('getRequiredFields', () => {
    it('returns expected required fields', () => {
      const testFormValues = [
        {
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
        },
        {
          firstName: '',
          lastName: '',
          address: '',
          city: '',
          country: 'CA',
          cardNumber: '',
          securityCode: '',
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
          cardNumber: '',
          securityCode: '',
          cardExpirationMonth: '',
          cardExpirationYear: '',
          optionalField: '',
        },
      ];

      testFormValues.forEach((formValues) => {
        const requiredFields = paymentForm.getRequiredFields(formValues);
        if (formValues.country) {
          const { optionalField, ...expectedRequiredFields } = formValues;
          expect(requiredFields).toEqual(expectedRequiredFields);
        } else {
          const { state, optionalField, ...expectedRequiredFields } = formValues;
          expect(requiredFields).toEqual(expectedRequiredFields);
        }
      });
    });
  });
  describe('onSubmit', () => {
    it('throws expected errors', () => {
      paymentForm.validateRequiredFields = jest.fn();
      paymentForm.validateCardDetails = jest.fn();
      paymentForm.scrollToError = jest.fn();
      const testFormValues = {
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        country: '',
        cardNumber: '',
        securityCode: '',
        cardExpirationMonth: '',
        cardExpirationYear: '',
      };
      const testData = [
        // validateRequiredFieldsMock
        // validateCardDetailsMock
        // expectedError
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
        paymentForm.validateRequiredFields.mockReturnValueOnce(testCaseData[0]);
        paymentForm.scrollToError.mockReturnValueOnce(testCaseData[0]);
        paymentForm.validateCardDetails.mockReturnValueOnce(testCaseData[1]);
        if (testCaseData[2]) {
          expect(() => paymentForm.onSubmit(testFormValues)).toThrow(testCaseData[2]);
        } else {
          expect(() => paymentForm.onSubmit(testFormValues)).not.toThrow();
        }
      });
    });
    it('sends track data on click', () => {
      analytics.sendTrackEvent = jest.fn();
      const eventName = 'edx.bi.ecommerce.basket.payment_selected';
      const eventProps = {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'Credit Card',
        checkoutType: 'client_side',
      };
      paymentForm.handleSubmitButtonClick(eventName, eventProps);
      expect(analytics.sendTrackEvent).toHaveBeenCalledWith(eventName, eventProps);
    });
  });
  describe('validateCardDetails', () => {
    it('returns expected errors', () => {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const testData = [
        // cardNumber, securityCode, cardExpirationMonth, cardExpirationYear, expectedErrors
        ['', '', '', '', {}],
        ['', '', `${currentMonth - 1}`, `${currentYear}`, { cardExpirationMonth: 'Card expired' }],
        ['41111', '', '', '', { cardNumber: 'Invalid card number' }],
        ['30569309025904', '', '', '', { cardNumber: 'Unsupported card type' }],
        ['4111111111111111', '12345', '', '', { securityCode: 'Invalid security code' }],
      ];

      testData.forEach((testCaseData) => {
        expect(paymentForm.validateCardDetails(
          testCaseData[0],
          testCaseData[1],
          testCaseData[2],
          testCaseData[3],
        )).toEqual(testCaseData[4]);
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
        lastName: 'This field is required',
      };
      expect(paymentForm.validateRequiredFields(values)).toEqual(expectedErrors);
    });
  });
  describe('scrollToError', () => {
    it('scrolls to the input name of the first error', () => {
      global.HTMLElement.prototype.scrollIntoView = jest.fn();
      const error = 'firstName';
      paymentForm.scrollToError(error);
      expect(global.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });
});
