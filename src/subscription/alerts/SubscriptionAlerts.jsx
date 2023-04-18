import React from 'react';
import AlertList from '../../feedback/AlertList';
import { EmptySubscriptionAlertMessage } from './EmptySubscriptionAlertMessage';

/**
 * SubscriptionAlerts
 * Reusable component to show server alerts
 * provide 'fallback-error' key to display fallback error message
 * TODO: fix the other and fallback error messages components
 */
export const SubscriptionAlerts = () => (
  <AlertList
    messageCodes={{
      empty_subscription: (<EmptySubscriptionAlertMessage />),
      program_unavailable: (
        <EmptySubscriptionAlertMessage />
      ),
      ineligible_program: (
        <EmptySubscriptionAlertMessage />
      ),
    }}
  />
);

export default SubscriptionAlerts;
