import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';

const FreeCheckoutOrderButton = ({ onClick }) => (
  <Hyperlink
    destination={`${getConfig().ECOMMERCE_BASE_URL}/checkout/free-checkout/`}
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

FreeCheckoutOrderButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default FreeCheckoutOrderButton;
