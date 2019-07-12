import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

import { basketSelector } from './data/selectors';
import { addMessage, MESSAGE_TYPES } from '../feedback';
import { ApplePayButton, redirectToReceipt } from './apple-pay';
import messages from './ApplePay.messages';

function ApplePay(props) {
  const handleMerchantValidationFailure = useCallback(() => {
    props.addMessage(
      'apple-pay-failure',
      props.intl.formatMessage(messages['payment.apple.pay.merchant.validation.failure']),
      null,
      MESSAGE_TYPES.WARNING,
    );
  });

  const handlePaymentAuthorizationFailure = useCallback(() => {
    props.addMessage(
      'apple-pay-failure',
      props.intl.formatMessage(messages['payment.apple.pay.authorization.failure']),
      null,
      MESSAGE_TYPES.ERROR,
    );
  });

  return (
    <ApplePayButton
      totalAmount={props.orderTotal}
      onPaymentComplete={redirectToReceipt}
      onMerchantValidationFailure={handleMerchantValidationFailure}
      onPaymentAuthorizationFailure={handlePaymentAuthorizationFailure}
      title={props.intl.formatMessage(messages['payment.apple.pay.pay.with.apple.pay'])}
      lang={props.intl.locale}
    />
  );
}

ApplePay.propTypes = {
  orderTotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  addMessage: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

ApplePay.defaultProps = {
  orderTotal: undefined,
};

export default connect(basketSelector, {
  addMessage,
})(injectIntl(ApplePay));
