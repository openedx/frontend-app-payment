import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const CartContents = ({ children }) => (
  <div className="basket-section">
    <h5 aria-level="2">
      <FormattedMessage
        id="payment.productlineitem.purchase.cart.heading"
        defaultMessage="In Your Cart"
        description="Heading of the cart in product details section"
      />
    </h5>
    <p>
      <FormattedMessage
        id="payment.productlineitem.purchase.cart.subheading"
        defaultMessage="Your purchase contains the following:"
        description="Subheading of the cart in product details section"
      />
    </p>
    {children}
  </div>
);

CartContents.propTypes = {
  children: PropTypes.node,
};

CartContents.defaultProps = {
  children: undefined,
};

export default CartContents;
