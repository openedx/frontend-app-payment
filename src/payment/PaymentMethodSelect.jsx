import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-i18n';
import messages from './PaymentMethodSelect.messages';

import AcceptedCardLogos from './assets/accepted-card-logos.png';
import ApplePayButtonContainer from './ApplePayButtonContainer';
import PayPalButtonContainer from './PayPalButtonContainer';
import { storeName } from './data/selectors';

function PaymentMethodSelect({
  intl,
  loading,
  isBasketProcessing,
  submitPayment,
  submitPaymentSuccess,
  submitPaymentFulfill,
}) {
  const submissionDisabled = loading || isBasketProcessing;

  return (
    <div className="basket-section">
      <h5 aria-level="2">
        <FormattedMessage
          id="payment.select.payment.method.heading"
          defaultMessage="Select Payment Method"
          description="The heading for the payment type selection section"
        />
      </h5>

      <p className="d-flex flex-wrap">
        <button className="payment-method-button active">
          <img
            src={AcceptedCardLogos}
            alt={intl.formatMessage(messages['payment.page.method.type.credit'])}
          />
        </button>

        <PayPalButtonContainer
          className={classNames({ 'skeleton-pulse': loading })}
          disabled={submissionDisabled}
        />
        <ApplePayButtonContainer
          className={classNames({ 'skeleton-pulse': loading })}
          disabled={submissionDisabled}
          beginHandler={submitPayment}
          successHandler={submitPaymentSuccess}
          cancelHandler={submitPaymentFulfill}
          failureHandler={submitPaymentFulfill}
          statePath={[storeName, 'basket']}
        />
      </p>
    </div>
  );
}

PaymentMethodSelect.propTypes = {
  intl: intlShape.isRequired,
  loading: PropTypes.bool.isRequired,
  isBasketProcessing: PropTypes.bool,
  submitPayment: PropTypes.func.isRequired,
  submitPaymentSuccess: PropTypes.func.isRequired,
  submitPaymentFulfill: PropTypes.func.isRequired,
};

PaymentMethodSelect.defaultProps = {
  isBasketProcessing: false,
};

export default injectIntl(PaymentMethodSelect);
