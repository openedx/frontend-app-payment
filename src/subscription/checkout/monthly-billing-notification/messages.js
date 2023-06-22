import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'subscription.checkout.billing.notification': {
    id: 'subscription.checkout.billing.notification',
    defaultMessage: 'You will be charged {price} {currency} {trialEnd} then monthly until you cancel your subscription.',
    description: 'Subscription monthly billing notification for Users that they will be charged every 31 days for this subscription.',
  },
  'subscription.checkout.billing.trial.date': {
    id: 'subscription.checkout.billing.trial.date',
    defaultMessage: 'on {date},',
    description: 'Subscription legal trialing helping text.',
  },
  'subscription.checkout.billing.resubscribe.date': {
    id: 'subscription.checkout.billing.resubscribe.date',
    defaultMessage: 'today,',
    description: 'Subscription legal resubscribe helping text.',
  },
});

export default messages;
