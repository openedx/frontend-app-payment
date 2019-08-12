import { defineMessages } from '@edx/frontend-i18n';

const messages = defineMessages({
  'payment.page.heading': {
    id: 'payment.page.heading',
    defaultMessage: 'Payment',
    description: 'The page heading for payment.',
  },
  'payment.loading.payment': {
    id: 'payment.loading.payment',
    defaultMessage: 'Loading basket...',
    description: 'Message when payment page is being loaded',
  },
  'payment.loading.error': {
    id: 'payment.loading.error',
    defaultMessage: 'Error: {error}',
    description: 'Message when payment page failed to load',
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
