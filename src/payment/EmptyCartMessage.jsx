import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

const EmptyCartMessage = () => (
  <div className="card">
    <div className="card-body">
      <h5 className="card-title">
        <FormattedMessage
          id="payment.empty.basket.heading"
          defaultMessage="Your cart is empty."
          description="The heading displayed when there is no basket"
        />
      </h5>
      <p className="card-text">
        <FormattedMessage
          id="payment.empty.basket.message"
          defaultMessage="If you attempted to make a purchase, you have not been charged. Return to your {actionLinkOne} to try again, or {actionLinkTwo}."
          description="The message displayed when there is no basket. Action links will redirect to dashboard or support page"
          values={{
            actionLinkOne: (
              <Hyperlink destination={getConfig().LMS_BASE_URL}>
                <FormattedMessage
                  id="payment.empty.basket.dashboardURL"
                  defaultMessage="dashboard"
                  description="The message displayed on the redirect to dashboard link"
                />
              </Hyperlink>
            ),
            actionLinkTwo: (
              <Hyperlink destination={getConfig().SUPPORT_URL}>
                <FormattedMessage
                  id="payment.empty.basket.supportURL"
                  defaultMessage="contact edX E-commerce Support"
                  description="The message displayed on the redirect to support page link"
                />
              </Hyperlink>
            ),
          }}
        />
      </p>
    </div>
  </div>
);

export default EmptyCartMessage;
