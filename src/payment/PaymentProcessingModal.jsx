import React, { useState, useEffect } from 'react';

import {
  ModalDialog, Spinner,
} from '@edx/paragon';
import { useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './PaymentProcessingModal.messages';
import { paymentProcessStatusSelector } from './data/selectors';

/**
 * PaymentProcessingModal
 */
export const PaymentProcessingModal = () => {
  const intl = useIntl();
  const shouldBeOpen = (status) => status === 'pending';
  const status = useSelector(paymentProcessStatusSelector);
  const [isOpen, setOpen] = useState(shouldBeOpen(status));

  useEffect(() => {
    setOpen(shouldBeOpen(status));
  }, [status]);

  if (!isOpen) { return null; }

  return (
    <ModalDialog
      title="Your Payment is Processing"
      isOpen={isOpen}
      onClose={() => {}}
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

export default PaymentProcessingModal;
