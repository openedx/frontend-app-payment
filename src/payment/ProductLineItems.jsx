import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ProductLineItem from './ProductLineItem';
import { productsSelector } from './data/selectors';

function ProductLineItems({ products }) {
  return (
    <React.Fragment>
      {products.map(product =>
        (<ProductLineItem
          {...product}
          key={product.name}
        />))}
    </React.Fragment>
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
