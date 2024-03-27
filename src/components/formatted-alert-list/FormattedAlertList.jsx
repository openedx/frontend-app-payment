import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../../payment/PaymentPage.messages';
import AlertList from '../../feedback/AlertList';
import {
  SingleEnrollmentCodeWarning,
  EnrollmentCodeQuantityUpdated,
  TransactionDeclined,
  BasketChangedError,
  DynamicPaymentMethodsNotCompatibleError,
  CaptureKeyTimeoutTwoMinutes,
  CaptureKeyTimeoutOneMinute,
} from '../../payment/AlertCodeMessages';

/**
 * FormattedAlertList
 * Reusable component to show server alerts
 */
export const FormattedAlertList = (props) => {
  const {
    summaryQuantity, summarySubtotal,
  } = props;
  const intl = useIntl();

  return (
    <AlertList
      /*
        For complex messages, the server will return a message code instead of a user message
        string. The values in the messageCodes object below will handle these messages. They can
        be a class/function, JSX element, or string. Class/functions and jsx elements will
        receive a 'values' prop of relevant data about the message. Strings will be rendered
        as-is.
      */
      messageCodes={{
        'single-enrollment-code-warning': SingleEnrollmentCodeWarning,
        'quantity-update-success-message': (
          <EnrollmentCodeQuantityUpdated
            values={{
              quantity: summaryQuantity,
              price: summarySubtotal,
            }}
          />
        ),
        'transaction-declined-message': (
          <TransactionDeclined />
        ),
        'basket-changed-error-message': (
          <BasketChangedError />
        ),
        'dynamic-payment-methods-country-not-compatible': (
          <DynamicPaymentMethodsNotCompatibleError />
        ),
        'capture-key-2mins-message': (
          <CaptureKeyTimeoutTwoMinutes />
        ),
        'capture-key-1min-message': (
          <CaptureKeyTimeoutOneMinute />
        ),
        'apple-pay-merchant-validation-failure': intl.formatMessage(messages['payment.apple.pay.merchant.validation.failure']),
        'apple-pay-authorization-failure': intl.formatMessage(messages['payment.apple.pay.authorization.failure']),
      }}
    />
  );
};

FormattedAlertList.propTypes = {
  summaryQuantity: PropTypes.number,
  summarySubtotal: PropTypes.number,
};

FormattedAlertList.defaultProps = {
  summaryQuantity: undefined,
  summarySubtotal: undefined,
};

export default FormattedAlertList;
