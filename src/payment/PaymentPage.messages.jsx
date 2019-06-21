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
});

export default messages;
