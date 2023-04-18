import React from 'react';
import { getConfig } from '@edx/frontend-platform';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink } from '@edx/paragon';

export const EmptySubscriptionAlertMessage = () => (
  <>
    <FormattedMessage
      id="subscription.alerts.messages.empty.details.heading"
      defaultMessage="Empty subscription details."
      description="Heading to notify user that they are not enrolled into any subscription program."
      tagName="h6"
    />
    <p className="card-text">
      <FormattedMessage
        id="subscription.alerts.messages.empty.details.message"
        defaultMessage="If you attempted to make a purchase, you have not been charged. Return to your {actionLinkOne} to try again, or {actionLinkTwo}."
        description="The message displayed when there is no basket. Action links will redirect to dashboard or support page"
        values={{
          actionLinkOne: (
            <Hyperlink destination={getConfig().LMS_BASE_URL}>
              <FormattedMessage
                id="subscription.alerts.messages.empty.details.dashboardURL"
                defaultMessage="dashboard"
                description="The message displayed on the redirect to dashboard link"
              />
            </Hyperlink>
          ),
          actionLinkTwo: (
            <Hyperlink destination={getConfig().SUPPORT_URL}>
              <FormattedMessage
                id="subscription.alerts.messages.empty.details.supportURL"
                defaultMessage="contact edX E-commerce Support"
                description="The message displayed on the redirect to support page link"
              />
            </Hyperlink>
          ),
        }}
      />
    </p>
  </>
);

export default EmptySubscriptionAlertMessage;
