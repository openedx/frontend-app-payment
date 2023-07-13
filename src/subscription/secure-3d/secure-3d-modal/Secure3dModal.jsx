import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  ModalDialog,
} from '@edx/paragon';
import { useSelector } from 'react-redux';

import { subscriptionStatusSelector } from '../../data/status/selectors';
import { detailsSelector } from '../../data/details/selectors';

/**
 * Secure3DModal
 * This modal implements the 3DS functionality for
 * both trial and non-trial purchases. It uses the setupIntent
 * for trial and paymentIntent function for non-trial
 * purchases in order to load 3DS details inside an iFrame modal
 */
export const Secure3DModal = ({ stripe }) => {
  const { status, confirmationClientSecret } = useSelector(subscriptionStatusSelector);
  const { isTrialEligible } = useSelector(detailsSelector);
  const [isOpen, setOpen] = useState(false);

  /**
   * loadSecureDetails
   */
  const loadSecureDetails = (url) => {
    setTimeout(() => {
      const container = document.getElementById('secure-3ds-wrapper');
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.width = '100%';
      iframe.height = '100%';
      container.appendChild(iframe);
    });
  };

  const retrieveSetupIntent = async () => {
    const response = await stripe.retrieveSetupIntent(confirmationClientSecret);
    if (response.error) { throw response.error; }
    return response.setupIntent;
  };

  const retrievePaymentIntent = async () => {
    const response = await stripe.retrievePaymentIntent(confirmationClientSecret);
    if (response.error) { throw response.error; }
    return response.paymentIntent;
  };

  const fetchSecureDetails = async () => {
    try {
      const fetchPaymentDetails = isTrialEligible ? retrieveSetupIntent : retrievePaymentIntent;
      const paymentDetails = await fetchPaymentDetails();
      loadSecureDetails(paymentDetails.next_action.redirect_to_url.url);
      setOpen(true);
    } catch (e) {
      // TODO: log the error to segment
      throw new Error(`Error loading 3D secure details): ${e.message}`);
    }
  };

  useEffect(() => {
    if (status === '3DS' || status === 'trialing') {
      fetchSecureDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const on3DSComplete = async () => {
    // Hide the 3DS UI
    setOpen(false);
    try {
      const fetchPaymentDetails = isTrialEligible ? retrieveSetupIntent : retrievePaymentIntent;
      const paymentDetails = await fetchPaymentDetails();
      if (paymentDetails.paymentIntent.status === 'succeeded') {
        // Show your customer that the payment has succeeded
      } else if (paymentDetails.paymentIntent.status === 'requires_payment_method') {
        // Authentication failed, prompt the customer to enter another payment method
      }
    } catch (e) {
      // TODO: log the error to segment
      throw new Error(`Error loading 3D secure details): ${e.message}`);
    }
  };

  window.addEventListener('message', (ev) => {
    if (ev.data === '3DS-authentication-complete') {
      on3DSComplete();
    }
  }, false);

  if (!isOpen) { return null; }

  return (
    <ModalDialog
      title="3DS Modal"
      isOpen={isOpen}
      onClose={() => {}}
      hasCloseButton={false}
      isFullscreenOnMobile={false}
      className="secure-3d-modal"
    >
      <div id="secure-3ds-wrapper" className="secure-3ds-wrapper" />
    </ModalDialog>
  );
};

Secure3DModal.propTypes = {
  stripe: PropTypes.shape({
    retrievePaymentIntent: () => {},
    retrieveSetupIntent: () => {},
  }).isRequired,
};

export default Secure3DModal;
