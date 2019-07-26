import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-i18n';
import messages from './PaymentMethodSelect.messages';

import AcceptedCardLogos from './assets/accepted-card-logos.png';
import { ApplePayButtonContainer } from './apple-pay';
import { PayPalButton } from './paypal';

function PaymentMethodSelect({ intl, loading }) {
  return (
    <div className="basket-section">
      <h5 aria-level="2">
        <FormattedMessage
          id="payment.select.payment.method.heading"
          defaultMessage="Select Payment Method"
          description="The heading for the payment type selection section"
        />
      </h5>

      <p className="d-flex ">
        <button className="payment-method-button active">
          <img
            src={AcceptedCardLogos}
            alt={intl.formatMessage(messages['payment.page.method.type.credit'])}
          />
        </button>

        <PayPalButton
          className={classNames({ 'skeleton-pulse': loading })}
          disabled={loading}
        />
        <ApplePayButtonContainer
          className={classNames({ 'skeleton-pulse': loading })}
          disabled={loading}
        />
      </p>
    </div>
  );
}

PaymentMethodSelect.propTypes = {
  intl: intlShape.isRequired,
  loading: PropTypes.bool.isRequired,
};


export default injectIntl(PaymentMethodSelect);
