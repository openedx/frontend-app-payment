import React from 'react';
import AlertList from '../../feedback/AlertList';
import {
  EmptySubscriptionMessage,
} from './ErrorMessages';

import { BasketChangedError } from '../../payment/AlertCodeMessages';

/**
 * SubscriptionAlerts
 * Reusable component to show server errors with i18n messages
 * provide 'fallback-error' key to display fallback error message
 */
export const SubscriptionAlerts = () => (
  <AlertList
    messageCodes={{
      empty_subscription: (<EmptySubscriptionMessage />),
      'embargo-error': (<EmptySubscriptionMessage />),
      'basket-changed-error': (<BasketChangedError />),
    }}
  />
);

export default SubscriptionAlerts;
