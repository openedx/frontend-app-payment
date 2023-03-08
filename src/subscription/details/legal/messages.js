import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'subscription.details.order.legal': {
    id: 'subscription.details.order.legal',
    defaultMessage: "By signing up for a subscription or starting a free trial, you authorize us to charge your card on file {price}/month for {programTitle} and any applicable taxes. If you signed up for a trial, we won’t charge your card until the end of your trial period. Your Blockchain Fundamentals subscription continues until canceled. Monthly subscriptions can be canceled at any time by {supportLink} Canceling a subscription stops the monthly recurring subscription charge, but doesn't refund the transaction for the current billing period. You can continue to access the subscription until the end of the then current billing period.",
    description: 'A paragraph explaining program subscription legal.',
  },
  'subscription.details.order.legal.link': {
    id: 'subscription.details.order.legal.link',
    defaultMessage: 'contacting customer support.',
    description: 'A link describing how to contact customer support.',
  },
});

export default messages;
