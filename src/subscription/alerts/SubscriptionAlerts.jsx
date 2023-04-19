import React from 'react';
import AlertList from '../../feedback/AlertList';
// import FallbackErrorMessage from '../../feedback/FallbackErrorMessage';

/**
 * SubscriptionAlerts
 * Reusable component to show server alerts
 * provide 'fallback-error' key to display fallback error message
 * TODO: fix the other and fallback error messages components
 * ! and remove commented code
 *
 * Add `not` to produce the program_unavailable error message
 * if program_metadata is not None:
 * Line 172 https://github.com/edx/subscriptions/blob/887a8dd52dc55f64534c820710d19565cc1f230e/subscriptions/apps/api/v1/views.py
 *
 * Remove `not` to produce the ineligible_program error message
 * if program_metadata.get('subscription_eligible', False):
 * Line 179 https://github.com/edx/subscriptions/blob/887a8dd52dc55f64534c820710d19565cc1f230e/subscriptions/apps/api/v1/views.py
 *
 * Close the Subs BE service and produce 500
 * for any other error render fallback-error message
 * and do not allow react app to crash
 */
export const SubscriptionAlerts = () => (
  <AlertList
    messageCodes={{
      // empty_subscription: (<FallbackErrorMessage />),
      // program_unavailable: (<FallbackErrorMessage />),
      // ineligible_program: (<FallbackErrorMessage />),
    }}
  />
);

export default SubscriptionAlerts;
