export const ORDER_TYPES = {
  BULK_ENROLLMENT: 'Enrollment Code',
  ENTITLEMENT: 'Course Entitlement',
  SEAT: 'Seat',
};

export const CERTIFICATE_TYPES = {
  VERIFIED: 'verified',
  CREDIT: 'credit',
};

/**
 * Payment State for async payment processing and UI Dialog Control.
 *
 * @see POLLING_PAYMENT_STATES
 *
 * @note: This enum is unique to Commerce Coordinator backend.
 */
export const PAYMENT_STATE = (((webserviceEnum = {
  // The enum as the WS Sees it.
  /**
   * Draft (Checkout) Payment
   */
  CHECKOUT: 'checkout',
  /**
   * Payment Complete
   */
  COMPLETED: 'completed',
  /**
   * Server Side Payment Failure
   */
  FAILED: 'failed',
  /**
   * Payment is Pending
   */
  PENDING: 'pending',
}) => ({
  ...webserviceEnum,

  // Our Additions

  /**
   * Default according to Redux initial state. (Should be an alias of an official value)
   *
   * @see PAYMENT_STATE.CHECKOUT
   */
  DEFAULT: webserviceEnum.CHECKOUT,

  /**
   * An HTTP Error has occurred between the client and server, this should not be sent over the line.
   *
   * @note **this is custom to the MFE**, thus a Symbol (which JSON usually skips in serialization)
   */
  HTTP_ERROR: Symbol('mfe-only_http_error'),
}))());

/**
 * An array of payment states that we intend to run polling against
 * @type {(string|Symbol)[]} Values from PAYMENT_STATE
 * @see PAYMENT_STATE
 */
export const POLLING_PAYMENT_STATES = [
  PAYMENT_STATE.PENDING,
  PAYMENT_STATE.HTTP_ERROR,
];

/**
 *
 * @type {number}
 *
 * This can be configured by setting `PAYMENT_STATE_POLLING_DELAY_SECS` in your config.
 */
export const DEFAULT_PAYMENT_STATE_POLLING_DELAY_SECS = 5;

/**
 *
 * @type {number}
 *
 * This can be configured by setting `PAYMENT_STATE_POLLING_MAX_ERRORS` in your config.
 */
export const DEFAULT_PAYMENT_STATE_POLLING_MAX_ERRORS = 5;
