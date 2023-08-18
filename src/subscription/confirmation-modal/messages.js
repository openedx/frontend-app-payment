import { defineMessages } from '@edx/frontend-platform/i18n';

export const messages = defineMessages({
  'subscription.confirmation.modal.trialing.heading': {
    id: 'subscription.confirmation.modal.trialing.heading',
    defaultMessage: 'Congratulations! Your 7-day free trial of {programTitle} has started.',
    description: 'Subscription trialing confirmation success heading.',
  },
  'subscription.confirmation.modal.trialing.body': {
    id: 'subscription.confirmation.modal.trialing.body',
    defaultMessage: "When your free trial ends, your subscription will begin, and we'll charge your payment method on file {price} {currency} per month. To avoid being charged, you must cancel before your trial expires. This subscription will automatically renew every month unless you cancel from the {ordersAndSubscriptionLink} page.",
    description: 'Subscription trialing confirmation success message explaining monthly subscription plan.',
  },
  'subscription.confirmation.modal.resubscribe.heading': {
    id: 'subscription.confirmation.modal.resubscribe.heading',
    defaultMessage: 'Congratulations! Your subscription to {programTitle} has started.',
    description: 'Subscription resubscribe confirmation success heading.',
  },
  'subscription.confirmation.modal.resubscribe.body': {
    id: 'subscription.confirmation.modal.resubscribe.body',
    defaultMessage: 'We charged your payment method {price} {currency}. This subscription will be automatically renewed and charged monthly unless you cancel from the {ordersAndSubscriptionLink} page.',
    description: 'Subscription resubscribe confirmation success message explaining monthly subscription plan.',
  },
  'subscription.confirmation.modal.body.orders.link': {
    id: 'subscription.confirmation.modal.body.orders.link',
    defaultMessage: 'Orders and Subscriptions',
    description: 'Subscription Orders & Subscriptions link placeholder.',
  },
});

export default messages;
