import React from 'react';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-i18n';
import messages from './PaymentMethodSelect.messages';

import AcceptedCardLogos from './assets/accepted-card-logos.png';
import { ApplePayButtonContainer } from './apple-pay';
import { PayPalButton } from './paypal';

function PaymentMethodSelect({ intl }) {
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
        <PayPalButton />
        <ApplePayButtonContainer />
      </p>
    </div>
  );
}

PaymentMethodSelect.propTypes = {
  intl: intlShape.isRequired,
};


export default injectIntl(PaymentMethodSelect);
