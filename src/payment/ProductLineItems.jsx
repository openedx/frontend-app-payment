import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-i18n';

import ProductLineItem from './ProductLineItem';
import { productsSelector } from './data/selectors';

function ProductLineItems({ products }) {
  return (

    <div className="basket-section">
      <h2 className="section-heading">
        <FormattedMessage
          id="payment.productlineitem.purchase.cart.heading"
          defaultMessage="In your cart"
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
      {products.map(product => <ProductLineItem {...product} key={product.name} />)}
    </div>
  );
}

ProductLineItems.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    imgUrl: PropTypes.string,
    name: PropTypes.string,
    seatType: PropTypes.oneOf(['professional', 'no-id-professional', 'verified', 'honor', 'audit']),
  })),
};

ProductLineItems.defaultProps = {
  products: [],
};

export default connect(productsSelector)(ProductLineItems);
