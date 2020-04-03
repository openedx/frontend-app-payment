import React from 'react';
import PropTypes from 'prop-types';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { markPerformanceIfAble, getPerformanceProperties } from '../performanceEventing';
import sendRev1074Event from '../sendRev1074Event';

class OrderSummary extends React.Component {
  componentDidMount() {
    markPerformanceIfAble('Order Summary component rendered');
    sendTrackEvent(
      'edx.bi.ecommerce.payment_mfe.order_summary_rendered',
      getPerformanceProperties(),
    );
    let renderTiming;
    try {
      const entries = window.performance.getEntriesByName('Order Summary component rendered');
      if (entries && entries.length > 0) {
        renderTiming = entries[entries.length - 1].toJSON();
      }
    } catch (e) {
      renderTiming = { error: e.toString() };
    }
    sendRev1074Event('payment_mfe.order_summary_rendered', { summaryRenderTiming: renderTiming });
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
