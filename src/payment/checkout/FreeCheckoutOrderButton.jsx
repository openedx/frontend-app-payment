import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-i18n';
import { Hyperlink } from '@edx/paragon';

function FreeCheckoutOrderButton({ ecommerceURL, onClick }) {
  return (
    <Hyperlink
      destination={`${ecommerceURL}/checkout/free-checkout/`}
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
  ecommerceURL: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default FreeCheckoutOrderButton;
