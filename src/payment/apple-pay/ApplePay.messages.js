import { defineMessages } from '@edx/frontend-i18n';

const messages = defineMessages({
  'payment.apple.pay.pay.with.apple.pay': {
    id: 'payment.apple.pay.pay.with.apple.pay',
    defaultMessage: 'Pay with Apple Pay',
    description: 'The title of an apple pay button',
  },
  'payment.apple.pay.merchant.validation.failure': {
    id: 'payment.apple.pay.merchant.validation.failure',
    defaultMessage: 'Apple Pay is not available at this time. Please try another payment method.',
    description: 'The message displayed to the user when an Apple Pay session fails to begin',
  },
  'payment.apple.pay.authorization.failure': {
    id: 'payment.apple.pay.authorization.failure',
    defaultMessage: 'An error occurred while processing your payment. You have not been charged. Please try again, or select another payment method.',
    description: 'The message displayed to the user when an Apple Pay payment fails',
  },
});

export default messages;
