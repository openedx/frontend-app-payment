import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Badge } from '@edx/paragon';

const SubscriptionContent = ({ children, details }) => (
  <div className="basket-section">
    <h5 aria-level="2">
      <FormattedMessage
        id="subscription.purchase.details.heading"
        defaultMessage="In your cart"
        description="Heading of the cart in the subscription details section"
      />
    </h5>
    <div className="">
      <div className="heading-badge-wrapper">
        <h3 aria-level="2" className="mb-0">
          {details.programTitle}
        </h3>
        <Badge variant="light">
          <FormattedMessage
            id="subscription.purchase.details.label"
            defaultMessage="Subscription"
            description="Badge label for the subscription"
          />
        </Badge>
      </div>

      <h4 aria-level="2" className="mb-0">
        <FormattedMessage
          id="subscription.certificate.type.professional"
          defaultMessage="Professional Certificate"
          description="Professional program certificate type to display subscription certificate type."
        />
      </h4>
      <p aria-level="2" className="body small mb-5">
        {details.organization}
      </p>
      <h5>
        <FormattedMessage
          id="subscription.purchase.details.product.list.heading"
          defaultMessage="Included with your subscription:"
          description="Subheading of the details in product list section"
        />
      </h5>
    </div>
    {children}
  </div>
);

SubscriptionContent.propTypes = {
  children: PropTypes.node.isRequired,
  details: PropTypes.shape({
    programTitle: PropTypes.string,
    certificateType: PropTypes.string,
    organization: PropTypes.string,
  }).isRequired,
};

export default SubscriptionContent;
