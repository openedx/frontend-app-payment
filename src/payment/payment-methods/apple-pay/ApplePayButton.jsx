import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { logError } from '@edx/frontend-platform/logging';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './ApplePay.messages';

class ApplePayButton extends React.Component {
  constructor(props) {
    super(props);
    let canMakePayments = false;

    try {
      canMakePayments = global.ApplePaySession && global.ApplePaySession.canMakePayments();
    } catch (error) {
      // We are likely on localhost without ssl
      logError(error);
    }

    this.state = {
      canMakePayments,
    };
  }

  render() {
    if (!this.state.canMakePayments) return null;
    const { intl, ...props } = this.props;

    return (
      <button
        {...props}
        id="applePayBtn"
        className={classNames('apple-pay-button', props.className)}
        title={intl.formatMessage(messages['payment.apple.pay.pay.with.apple.pay'])}
        lang={intl.locale}
      />
    );
  }
}

ApplePayButton.propTypes = {
  intl: intlShape.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

ApplePayButton.defaultProps = {
  className: undefined,
  disabled: false,
  onClick: undefined,
};

export default injectIntl(ApplePayButton);
