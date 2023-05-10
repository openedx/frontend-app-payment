import React from 'react';
import PropTypes from 'prop-types';

import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { markPerformanceIfAble, getPerformanceProperties } from '../performanceEventing';

class OrderSummary extends React.Component {
  componentDidMount() {
    markPerformanceIfAble('Order Summary component rendered');
    const subsEventProperties = this.props.isSubscription ? this.props.subscriptionEventProps : {};

    sendTrackEvent(
      'edx.bi.ecommerce.payment_mfe.order_summary_rendered',
      {
        ...getPerformanceProperties(),
        flexMicroformEnabled: true,
        ...subsEventProperties,
      },
    );
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
  subscriptionEventProps: PropTypes.shape({
    isTrialEligible: PropTypes.bool,
    isNewSubscription: PropTypes.bool,
    paymentProcessor: PropTypes.string,
    programUuid: PropTypes.string,
  }),
  isSubscription: PropTypes.bool,
};

OrderSummary.defaultProps = {
  children: undefined,
  isSubscription: false,
  subscriptionEventProps: null,
};

export default OrderSummary;
