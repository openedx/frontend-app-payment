import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-i18n';

import markPerformanceIfAble from '../../speedcurve';

class OrderSummary extends React.Component {
  componentDidMount() {
    markPerformanceIfAble('Order Summary component rendered');
  }

  render() {
    const {
      children,
    } = this.props;

    return (
      <div
        role="region"
        aria-labelledby="summary-heading"
        aria-live="polite"
        className="basket-section"
      >
        <h5 id="summary-heading" aria-level="2">
          <FormattedMessage
            id="payment.order.details.heading"
            defaultMessage="Summary"
            description="The heading for the order summary table and coupon section of the basket"
          />
        </h5>
        {children}
      </div>
    );
  }
}

OrderSummary.propTypes = {
  children: PropTypes.node,
};

OrderSummary.defaultProps = {
  children: undefined,
};

export default OrderSummary;
