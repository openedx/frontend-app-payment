import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'payment.processing.modal.message': {
    id: 'payment.processing.modal.message',
    defaultMessage: 'Payment is processing, please don\'t refresh, leave or close this page.',
    description: 'Payment processing waiting message.',
  },
  'payment.processing.modal.sr.spinner-text': {
    id: 'payment.processing.modal.sr.spinner-text',
    defaultMessage: 'processing',
    description: 'Screen Reader: Spinner.',
  },
});

export default messages;
