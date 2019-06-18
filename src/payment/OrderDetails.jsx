import React from 'react';
import { FormattedMessage } from '@edx/frontend-i18n';

function OrderDetails() {
  return (
    <div className="basket-section">
      <h2 className="section-heading">
        <FormattedMessage
          id="payment.order.details.heading"
          defaultMessage="Order Details"
          description="The heading for details about an order"
        />
      </h2>

      <FormattedMessage
        tagName="p"
        id="payment.order.details.course.autoenroll"
        defaultMessage="After you complete your order you will be automatically enrolled in the verified track of the course."
        description="A paragraph explaining what will happen after the user pays for the verified track of a course"
      />
    </div>
  );
}

export default OrderDetails;
