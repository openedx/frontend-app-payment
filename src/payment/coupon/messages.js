import { defineMessages } from '@edx/frontend-i18n';

const messages = defineMessages({
  'payment.coupon.label': {
    id: 'payment.coupon.label',
    defaultMessage: 'Add coupon code (optional)',
    description: 'Label for the add coupon form',
  },
  'payment.coupon.submit': {
    id: 'payment.coupon.submit',
    defaultMessage: 'Apply',
    description: 'Submit button for the add coupon form',
  },
  'payment.coupon.remove': {
    id: 'payment.coupon.remove',
    defaultMessage: 'Remove',
    description: 'Submit button to remove a coupon',
  },
  'payment.coupon.benefit_value': {
    id: 'payment.coupon.benefit_value',
    defaultMessage: 'Coupon {code} applied for {value} off',
    description: 'The description of a coupon for a percentage off the total price. Percentage symbol is included in {value}',
  },
  'payment.coupon.benefit.default': {
    id: 'payment.coupon.benefit.default',
    defaultMessage: 'Coupon {code} applied',
    description: 'The description of a coupon without any specific monetary value off.',
  },
  'payment.coupon.added': {
    id: 'payment.coupon.added',
    defaultMessage: "Coupon code '{code}' was added to your basket.",
    description: 'Notification to the user that a coupon code has been added to their basket.',
  },
  'payment.coupon.removed': {
    id: 'payment.coupon.removed',
    defaultMessage: "Coupon code '{code}' was removed from your basket.",
    description: 'Notification to the user that a coupon code has been removed from their basket.',
  },
  'payment.coupon.error.unknown': {
    id: 'payment.coupon.error.unknown',
    defaultMessage: "We couldn't apply that coupon.",
    description: 'The error message shown to the user when an unknown error occurred while trying to apply a coupon code',
  },
  'payment.coupon.error.empty_basket': {
    id: 'payment.coupon.error.empty_basket',
    defaultMessage: "Coupon code '{code}' cannot be applied because your basket is empty.",
    description: 'The error message shown to the user when they try to apply a coupon code when their basket is empty.',
  },
  'payment.coupon.error.already_applied_voucher': {
    id: 'payment.coupon.error.already_applied_voucher',
    defaultMessage: "You have already added coupon code '{code}' to your basket.",
    description: 'The error message shown to the user when they have already applied a given coupon code to their basket.',
  },
  'payment.coupon.error.code_does_not_exist': {
    id: 'payment.coupon.error.code_does_not_exist',
    defaultMessage: "Coupon code '{code}' does not exist.",
    description: 'The error message shown to the user when they try to use an unknown coupon code.',
  },
  'payment.coupon.error.code_expired': {
    id: 'payment.coupon.error.code_expired',
    defaultMessage: "Coupon code '{code}' has expired.",
    description: 'The error message shown to the user when they try to use an expired coupon code.',
  },
  'payment.coupon.error.code_not_active': {
    id: 'payment.coupon.error.code_not_active',
    defaultMessage: "Coupon code '{code}'is not active.",
    description: 'The error message shown to the user when they try to use an inactive coupon code.',
  },
  'payment.coupon.error.code_not_available': {
    id: 'payment.coupon.error.code_not_available',
    defaultMessage: "Coupon code '{code}'is not available.",
    description: 'The error message shown to the user when they try to use an unavailable coupon code.',
  },
  'payment.coupon.error.code_not_valid': {
    id: 'payment.coupon.error.code_not_valid',
    defaultMessage: "Coupon code '{code}'is not valid for this basket.",
    description: 'The error message shown to the user when they try to use an invalid coupon code.',
  },
});

export default messages;
