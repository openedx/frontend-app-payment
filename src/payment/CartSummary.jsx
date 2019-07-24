import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-i18n';

import ProductLineItem from './ProductLineItem';
import UpdateQuantityForm from './UpdateQuantityForm';
import { cartSelector } from './data/selectors';
import { ORDER_TYPES } from './data/constants';

function CartSummary({ products, orderType }) {
  return (
    <div className="basket-section">
      <h2 className="section-heading">
        <FormattedMessage
          id="payment.productlineitem.purchase.cart.heading"
          defaultMessage="In Your Cart"
          description="Heading of the cart in product details section"
        />
      </h2>
      <p>
        <FormattedMessage
          id="payment.productlineitem.purchase.cart.subheading"
          defaultMessage="Your purchase contains the following:"
          description="Subheading of the cart in product details section"
        />
      </p>
      {products.map(product => <ProductLineItem {...product} key={product.title} />)}
      {orderType === ORDER_TYPES.BULK_ENROLLMENT ? <UpdateQuantityForm /> : null}
    </div>
  );
}

CartSummary.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    imageUrl: PropTypes.string,
    title: PropTypes.string,
    certificateType: PropTypes.oneOf(['audit', 'honor', 'verified', 'no-id-professional', 'professional', 'credit']),
  })),
  orderType: PropTypes.oneOf(Object.values(ORDER_TYPES)),
};

CartSummary.defaultProps = {
  products: [],
  orderType: ORDER_TYPES.SEAT,
};

export default connect(cartSelector)(CartSummary);
