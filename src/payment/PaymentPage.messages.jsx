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
  'payment.messages.enrollment-code-product-info.link': {
    id: 'payment.messages.enrollment-code-product-info.link',
    defaultMessage: 'click here to enroll directly',
    description: 'A link that takes the user to a page where they can enroll directly.',
  },
});

export default messages;
