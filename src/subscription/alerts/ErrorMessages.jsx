import { FormattedMessage } from '@edx/frontend-platform/i18n';

// eslint-disable-next-line import/prefer-default-export
export const EmptySubscriptionMessage = () => (
  <FormattedMessage
    id="subscription.messages.empty.subscription"
    defaultMessage="You don't have any active subscription."
    description="Notifies the user their they don't have any active subscriptions available."
  />
);
