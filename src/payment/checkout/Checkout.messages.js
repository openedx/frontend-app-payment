import { defineMessages } from '@edx/frontend-i18n';

const messages = defineMessages({
  'payment.section.cart.label': {
    id: 'payment.section.cart.label',
    defaultMessage: 'Shopping Cart Details',
    description: 'Screen reader label for cart detail section of page',
  },
  'payment.section.payment.details.label': {
    id: 'payment.section.payment.details.label',
    defaultMessage: 'Payment Details',
    description: 'Screen reader label for payment detail section of page',
  },
  'payment.page.method.type.credit': {
    id: 'payment.page.method.type.credit',
    defaultMessage: 'Credit Card',
    description: 'The alt text for image button for credit card payment type',
  },
  'payment.page.method.type.paypal': {
    id: 'payment.page.method.type.paypal',
    defaultMessage: 'PayPal',
    description: 'The alt text for image button for paypal payment type',
  },
});

export default messages;
