import React, { useEffect, useState } from 'react';

import { ModalDialog, Spinner } from '@edx/paragon';
import { connect, useSelector } from 'react-redux';
import { injectIntl, useIntl } from '@edx/frontend-platform/i18n';

import messages from './PaymentProcessingModal.messages';
import { paymentProcessStatusIsPollingSelector, paymentProcessStatusSelector } from './data/selectors';
import { POLLING_PAYMENT_STATES } from './data/constants';

/**
 * PaymentProcessingModal
 *
 * This modal is controlled primarily by some Redux selectors.
 *
 * Controls Visibility: `paymentProcessStatusSelector`, `paymentProcessStatusIsPollingSelector`
 * @see paymentProcessStatusSelector
 * @see paymentProcessStatusIsPollingSelector
 *
 * Primary Event: `updatePaymentState`
 * @see updatePaymentState
 *
 * If you wish to perform an action as this dialog closes, please register for the updatePaymentState fulfill event.
 */
export const PaymentProcessingModal = () => {
  /**
   * Determine if the Dialog should be open based on Redux state input
   * @param s {PAYMENT_STATE} The value of the payment state as we currently know it (`paymentProcessStatusSelector`)
   * @param p {boolean} is currently polling/still polling for status (`paymentProcessStatusIsPollingSelector`)
   * @return {boolean}
   */
  const shouldBeOpen = (s, p) => p || POLLING_PAYMENT_STATES.includes(s);

  const intl = useIntl();

  const status = useSelector(paymentProcessStatusSelector);
  const isPolling = useSelector(paymentProcessStatusIsPollingSelector);
  const [isOpen, setOpen] = useState(shouldBeOpen(status, isPolling));

  useEffect(() => {
    setOpen(shouldBeOpen(status, isPolling));
  }, [status, isPolling]);

  if (!isOpen) {
    return null;
  }

  return (
    <ModalDialog
      title="Your Payment is Processing"
      isOpen={isOpen}
      onClose={() => { /* Noop, @see updatePaymentState fulfill */ }}
      hasCloseButton={false}
      isFullscreenOnMobile={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title as="h3">
          {
            intl.formatMessage(messages['payment.processing.modal.message'])
          }
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className="text-center">
          <Spinner
            animation="border"
            screenReaderText={intl.formatMessage(messages['payment.processing.modal.sr.spinner-text'])}
          />
        </div>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default connect()(injectIntl(PaymentProcessingModal));
