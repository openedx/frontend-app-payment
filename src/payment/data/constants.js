/**
 * Order Types are the possible types of products a learner can purchase.
 *
 * Each product type may have different user flow requirements.
 *
 * For example, bulk enrollments allow users to change the quantity of a product.
 *
 * @readonly
 * @enum {string}
 */
export const ORDER_TYPES = {
  /**
   * Bulk Enrollment Code Purchases
   *
   * Permits selective quantity purchases of enrollment codes
   *
   * A bulk-purchases on a single course, usually B2C for 100% off of course seats.
   */
  BULK_ENROLLMENT: 'Enrollment Code',

  /**
   * Program Entitlement
   *
   * A purchase of a program, which are multiple products called "course entitlements."
   *
   * A course entitlement allows a learner to redeem the entitlement for a seat in a course at a future time.
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
export const PAYMENT_STATE = (((commerceCoordinatorEnumValues = {
  // The enum as defined within Commerce Coordinator
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
  // Inherit values as defined within the Commerce Coordinator and its API Spec
  ...commerceCoordinatorEnumValues,

  // MFE Specific additions for initial state (defaults) and error handling.

  /**
   * Default according to Redux initial state. (Should be an alias of an official value)
   *
   * @see PAYMENT_STATE.CHECKOUT
   */
  DEFAULT: commerceCoordinatorEnumValues.CHECKOUT,

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
 *
 * Waffle flags my be set in the various .env files under the variable `WAFFLE_FLAGS` as well
 * as via query params in your browser's address bar... Both cases are processed via the same
 * processor and must be prefixed with `dwft_`.
 *
 * @readonly
 * @enum {string}
 *
 * @see processUrlWaffleFlags
 */
export const WAFFLE_FLAG_NAMES = {
  /**
   * Flag to determine if Commerce Coordinator is enabled.
   */
  COMMERCE_COORDINATOR_ENABLED: 'transition_to_coordinator.order_create',
};
