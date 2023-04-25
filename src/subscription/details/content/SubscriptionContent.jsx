import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Badge } from '@edx/paragon';
import { ProgramType } from '../program-type/ProgramType';

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

      <ProgramType type={details.programType} />
      {
        details.organizations?.map((org) => (
          <p key={org} aria-level="2" className="body small mb-5">
            {org}
          </p>
        ))
      }
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
    programType: PropTypes.string,
    organizations: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default SubscriptionContent;
