import React from 'react';
import AlertList from '../../feedback/AlertList';

import { BasketChangedError } from '../../payment/AlertCodeMessages';

import {
  EmbargoErrorMessage,
  ProgramUnavailableMessage,
  IneligibleProgramErrorMessage,
} from './ErrorMessages';

/**
 * SubscriptionAlerts
 * Reusable component to show server errors with i18n messages
 * provide 'fallback-error' key to display fallback error message
 */
export const SubscriptionAlerts = () => (
  <AlertList
    messageCodes={{
      embargo_error: (<EmbargoErrorMessage />),
      basket_changed_error: (<BasketChangedError />),
      program_unavailable: (<ProgramUnavailableMessage />),
      ineligible_program: (<IneligibleProgramErrorMessage />),
    }}
  />
);

export default SubscriptionAlerts;
