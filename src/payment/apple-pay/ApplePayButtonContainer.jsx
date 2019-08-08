import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

import { addMessage, clearMessages, MESSAGE_TYPES } from '../../feedback';
import ApplePayButton from './ApplePayButton';
import { redirectToReceipt } from './service';

import messages from './ApplePay.messages';
import { getModuleState } from '../../common/utils';

function ApplePayButtonContainer(props) {
  const handleMerchantValidationFailure = useCallback(() => {
    props.clearMessages();
    props.addMessage(
      'apple-pay-failure',
      props.intl.formatMessage(messages['payment.apple.pay.merchant.validation.failure']),
      null,
      MESSAGE_TYPES.WARNING,
    );
    if (props.failureHandler !== undefined) {
      props.failureHandler();
    }
  });

  const handlePaymentAuthorizationFailure = useCallback(() => {
    props.clearMessages();
    props.addMessage(
      'apple-pay-failure',
      props.intl.formatMessage(messages['payment.apple.pay.authorization.failure']),
      null,
      MESSAGE_TYPES.ERROR,
    );
    if (props.failureHandler !== undefined) {
      props.failureHandler();
    }
  });

  const handlePaymentBegin = useCallback(() => {
    if (props.beginHandler !== undefined) {
      props.beginHandler();
    }
  });

  const handlePaymentComplete = useCallback((orderNumber) => {
    if (props.successHandler !== undefined) {
      props.successHandler();
    }
    redirectToReceipt(orderNumber);
  });

  const handlePaymentCancel = useCallback(() => {
    if (props.cancelHandler !== undefined) {
      props.cancelHandler();
    }
  });

  return (
    <ApplePayButton
      className={`payment-method-button ${props.className}`}
      disabled={props.disabled}
      totalAmount={props.orderTotal}
      onPaymentBegin={handlePaymentBegin}
      onPaymentComplete={handlePaymentComplete}
      onPaymentCancel={handlePaymentCancel}
      onMerchantValidationFailure={handleMerchantValidationFailure}
      onPaymentAuthorizationFailure={handlePaymentAuthorizationFailure}
      title={props.intl.formatMessage(messages['payment.apple.pay.pay.with.apple.pay'])}
      lang={props.intl.locale}
    />
  );
}

ApplePayButtonContainer.propTypes = {
  orderTotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  addMessage: PropTypes.func.isRequired,
  clearMessages: PropTypes.func.isRequired,
  beginHandler: PropTypes.func,
  successHandler: PropTypes.func,
  cancelHandler: PropTypes.func,
  failureHandler: PropTypes.func,
  intl: intlShape.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

ApplePayButtonContainer.defaultProps = {
  orderTotal: undefined,
  className: undefined,
  disabled: false,
  beginHandler: undefined,
  successHandler: undefined,
  cancelHandler: undefined,
  failureHandler: undefined,
};

const mapStateToProps = (state, props) => {
  // Allows the apple-pay module to be agnostic about where its redux data exists
  // in the tree.
  const basketState = getModuleState(state, props.statePath);
  return {
    orderTotal: basketState.orderTotal,
  };
};

export default connect(mapStateToProps, {
  addMessage,
  clearMessages,
})(injectIntl(ApplePayButtonContainer));
