import React from 'react';
import AlertList from '../../feedback/AlertList';
import {
  EmptySubscriptionMessage,
  ExpiredSubscription,
} from './ErrorMessages';

/**
 * SubscriptionAlerts
 * Reusable component to show server errors with i18n messages
 * provide 'fallback-error' key to display fallback error message
 */
export const SubscriptionAlerts = () => (
  <AlertList
    messageCodes={{
      empty_subscription: (<EmptySubscriptionMessage />),
      subscription_expired: (<ExpiredSubscription />),
    }}
  />
);

export default SubscriptionAlerts;
