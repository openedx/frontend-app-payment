import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  'payment.form.errors.invalid.card.number': {
    id: 'payment.form.errors.invalid.card.number',
    defaultMessage: 'Invalid card number',
    description: 'The form field feedback text for invalid card number error.',
  },
  'payment.form.errors.unsupported.card': {
    id: 'payment.form.errors.unsupported.card',
    defaultMessage: 'Unsupported card type',
    description: 'The form field feedback text for unsupported credit card error.',
  },
  'payment.form.errors.invalid.security.code': {
    id: 'payment.form.errors.invalid.security.code',
    defaultMessage: 'Invalid security code',
    description: 'The form field feedback text for invalid credit card security code error.',
  },
  'payment.form.errors.card.expired': {
    id: 'payment.form.errors.card.expired',
    defaultMessage: 'Card expired',
    description: 'The form field feedback text for card expired error.',
  },
  'payment.form.errors.required.field': {
    id: 'payment.form.errors.required.field',
    defaultMessage: 'This field is required',
    description: 'The form field feedback text for missing required field error.',
  },
  'payment.form.errors.ascii.name': {
    id: 'payment.form.errors.ascii.name',
    defaultMessage: 'We apologize for the inconvenience but for the time being we require ASCII characters in the name field. We are working on addressing this and appreciate your patience.',
    description: 'The form field feedback text for name format issue.',
  },
});

export default messages;
