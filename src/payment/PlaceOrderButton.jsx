import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-i18n';
import { Hyperlink } from '@edx/paragon';

import { paymentSelector } from './data/selectors';

function PlaceOrderButton({ ecommerceURL }) {
  return (
    <Hyperlink destination={`${ecommerceURL}/checkout/free-checkout/`}>
      <button className="btn btn-primary btn-lg" >
        <FormattedMessage
          id="payment.form.submit.button.text"
          defaultMessage="Place Order"
          description="The label for the payment form submit button"
        />
      </button>
    </Hyperlink>
  );
}

PlaceOrderButton.propTypes = {
  ecommerceURL: PropTypes.string.isRequired,
};

export default connect(paymentSelector)(PlaceOrderButton);
