/**
 * Order Types
 * @readonly
 * @enum {string}
 */
export const ORDER_TYPES = {
  /**
   * The Redemption of a Single Course Enrollment Code
   *
   * A bulk-purchases on a single course, usually B2C for 100% off of course seats.
   */
  BULK_ENROLLMENT: 'Enrollment Code',

  /**
   * Program Entitlement
   *
   * This means someone has purchased a full program containing the course, so they have already paid but may not
   * actually be enrolled in a run.
   */
  ENTITLEMENT: 'Course Entitlement',

  /**
   *  A Single Course Purchase
   *
   *  A purchased seat in a single course run.
   */
  SEAT: 'Seat',
};

/**
 * Possible Standard Certificate Types
 *
 * These are marked as unused, however they do exist as constants in Order Details and a few other places.
 *
 * @readonly
 * @enum {string}
 */
export const CERTIFICATE_TYPES = {
  /**
   * Standard (Paid) Certificate
   */
  VERIFIED: 'verified',
  /**
   * Certificate with College/University Credit
   */
  CREDIT: 'credit',
};

/**
 * Payment State for async payment processing and UI Dialog Control.
 *
 * @see POLLING_PAYMENT_STATES
 *
 * @note: This enum is unique to Commerce Coordinator backend.
 *
 * @readonly
 * @enum {string|Symbol}
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
   *
   * @type {Symbol}
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
 * Default Delay between rounds of Payment State Polling
 *
 * @type {number}
 *
 * > Note: This can be configured by setting `PAYMENT_STATE_POLLING_DELAY_SECS` in your config.
 */
export const DEFAULT_PAYMENT_STATE_POLLING_DELAY_SECS = 5;

/**
 * Default number of maximum HTTP errors before give up
 *
 * @type {number}
 *
 * > Note: This can be configured by setting `PAYMENT_STATE_POLLING_MAX_ERRORS` in your config.
 */
export const DEFAULT_PAYMENT_STATE_POLLING_MAX_ERRORS = 5;

/**
 * An enum of known Waffle Flags
 * @readonly
 * @enum {string}
 */
export const WAFFLE_FLAGS = {
  /**
   * Flag to determine if Commerce Coordinator is enabled
   *
   * @note this is the flag for Theseus' `MS1`, and was chosen as it is the first point of transition to use of CC.
   */
  COMMERCE_COORDINATOR_ENABLED: 'transition_to_coordinator.order_create',
};
