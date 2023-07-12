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
 * for trial purchases and paymentIntent function for non-trial
 * purchases in order to load 3DS details inside an iFrame modal
 */
export const Secure3DModal = ({ stripe }) => {
  const { status, confirmationClientSecret } = useSelector(subscriptionStatusSelector);
  const { isTrialEligible } = useSelector(detailsSelector);
  const [isOpen, setOpen] = useState(false);

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
    return response.setupIntent.next_action.redirect_to_url.url;
  };

  const retrievePaymentIntent = async () => {
    const response = await stripe.retrievePaymentIntent(confirmationClientSecret);
    if (response.error) { throw response.error; }
    return response.paymentIntent.next_action.redirect_to_url.url;
  };

  const fetchSecureDetails = async () => {
    try {
      const fetchPaymentDetails = isTrialEligible ? retrieveSetupIntent : retrievePaymentIntent;
      const secureUrl = await fetchPaymentDetails();
      loadSecureDetails(secureUrl);
      setOpen(true);
    } catch (e) {
      throw new Error(`Error loading 3D secure details): ${e.message}`);
    }
  };

  // useEffect(() => {
  //   loadSecureDetails('https://hooks.stripe.com/3d_secure_2/hosted?merchant=acct_1Ls7QSH4caH7G0X1&publishable_key=pk_test_51Ls7QSH4caH7G0X1prLj26IWylx2AP5vGA3nd4GMGPRXjVQlA9HATsF2aC5QhbeGNnTr2xijDLQPQzqefrMvHvke00L5eGLK4N&setup_intent=seti_1NT1qtH4caH7G0X1dWG6wrbZ&setup_intent_client_secret=seti_1NT1qtH4caH7G0X1dWG6wrbZ_secret_OFWuX8eF6y1oYQDaPcJF4GGf70jgg4B&source=src_1NT1quH4caH7G0X15pCrAdil');
  // }, []);

  useEffect(() => {
    if (status === '3DS') {
      fetchSecureDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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
