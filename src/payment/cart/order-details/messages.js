import { defineMessages } from '@edx/frontend-i18n';

const messages = defineMessages({
  'payment.order.details.course.entitlement': {
    id: 'payment.order.details.course.entitlement',
    defaultMessage: 'After you complete your order you will be able to select course dates from your dashboard.',
    description: 'A paragraph explaining what will happen after the user pays for an entitlement course.',
  },
  'payment.order.details.course.seat.verified': {
    id: 'payment.order.details.course.seat.verified',
    defaultMessage: 'After you complete your order you will be automatically enrolled in the verified track of the course.',
    description: 'A paragraph explaining what will happen after the user pays for the verified track of a course.',
  },
  'payment.order.details.course.seat.credit': {
    id: 'payment.order.details.course.seat.credit',
    defaultMessage: 'After you complete your order you will receive credit for your course.',
    description: 'A paragraph explaining what will happen after the user pays for a course the will receive credit for.',
  },
  'payment.order.details.course.seat': {
    id: 'payment.order.details.course.seat',
    defaultMessage: 'After you complete your order you will be automatically enrolled in the course.',
    description: 'A paragraph explaining what will happen after the user pays for a course.',
  },
});

export default messages;
