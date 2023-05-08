import { FormattedMessage } from '@edx/frontend-platform/i18n';

export const EmptySubscriptionMessage = () => (
  <FormattedMessage
    id="subscription.messages.empty.subscription"
    defaultMessage="You don't have any active subscription."
    description="Notifies the user their they don't have any active subscriptions available."
  />
);

export const ExpiredSubscription = () => (
  <>
    <FormattedMessage
      id="subscription.messages.dueDate.expired.heading"
      defaultMessage="Subscription Expired"
      description="Heading for notifying user that they are trying to purchase an expired subscription."
      tagName="h6"
    />
    <FormattedMessage
      id="subscription.messages.dueDate.expired.body"
      defaultMessage="We regret to inform you that you are trying to purchase an expired subscription."
      description="Notifies the user their they don't have any active subscriptions available."
    />
  </>
);
