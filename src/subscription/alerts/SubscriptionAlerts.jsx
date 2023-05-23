import React from 'react';
import AlertList from '../../feedback/AlertList';
import FallbackErrorMessage from '../../feedback/FallbackErrorMessage';

import { BasketChangedError } from '../../payment/AlertCodeMessages';

/**
 * SubscriptionAlerts
 * Reusable component to show server errors with i18n messages
 * provide 'fallback-error' key to display fallback error message
 */
export const SubscriptionAlerts = () => (
  <AlertList
    messageCodes={{
      empty_subscription: (<FallbackErrorMessage />),
      embargo_error: (<FallbackErrorMessage />),
      basket_changed_error: (<BasketChangedError />),
    }}
  />
);

export default SubscriptionAlerts;
