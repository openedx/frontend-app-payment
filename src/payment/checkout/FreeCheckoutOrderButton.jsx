import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-i18n';
import { Hyperlink } from '@edx/paragon';
import { App } from '@edx/frontend-base';

function FreeCheckoutOrderButton({ onClick }) {
  return (
    <Hyperlink
      destination={`${App.config.ECOMMERCE_BASE_URL}/checkout/free-checkout/`}
      className="btn btn-primary btn-lg"
      onClick={onClick}
    >
      <FormattedMessage
        id="payment.form.submit.button.text"
        defaultMessage="Place Order"
        description="The label for the payment form submit button"
      />
    </Hyperlink>
  );
}

FreeCheckoutOrderButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default FreeCheckoutOrderButton;
