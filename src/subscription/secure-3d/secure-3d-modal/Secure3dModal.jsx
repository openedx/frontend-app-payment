import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import {
  ModalDialog,
} from '@edx/paragon';
import {
  PaymentElement,
} from '@stripe/react-stripe-js';

import { subscriptionStatusSelector } from '../../data/status/selectors';
import { detailsSelector } from '../../data/details/selectors';

import {
  onSuccessful3DS,
} from '../../data/status/actions';

/**
 * Secure3DModal
 * This modal implements the 3DS functionality for
 * both trial and non-trial purchases. It uses the setupIntent
 * for trial and paymentIntent for non-trial
 * purchases in order to load 3DS details inside an iFrame modal
 */
export const Secure3DModal = ({ stripe, elements }) => {
  const dispatch = useDispatch();
  const modalRef = useRef('inactive');
  const [isOpen, setOpen] = useState(false);

  const { isTrialEligible } = useSelector(detailsSelector);
  const { status, confirmationClientSecret } = useSelector(subscriptionStatusSelector);

  /**
   * loadSecureDetails
  */
  const loadSecureDetails = (url) => {
    setTimeout(() => {
      const container = document.getElementById('secure-3ds-wrapper');
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.id = 'secure-3d-iframe';
      iframe.width = '100%';
      iframe.height = '100%';
      container.appendChild(iframe);
    });
  };

  /**
   * retrieveSetupIntent
   * call this method with subscription in trial mode
   */
  const retrieveSetupIntent = async () => {
    const response = await stripe.retrieveSetupIntent(confirmationClientSecret);
    if (response.error) { throw response.error; }
    return response.setupIntent;
  };

  /**
   * retrievePaymentIntent
   * call this method with subscription in non-trial mode
   */
  const retrievePaymentIntent = async () => {
    const response = await stripe.retrievePaymentIntent(confirmationClientSecret);
    if (response.error) { throw response.error; }
    return response.paymentIntent;
  };

  /**
   * on3DSComplete
   * callback to handle 3DS completion state
   */
  const on3DSComplete = async () => {
    // Hide the 3DS UI
    if (modalRef.current === 'active') {
      // completed 3DS, set to inactive so multiple state updates doesn't trigger the 3DS update
      modalRef.current = 'inactive';
      dispatch(onSuccessful3DS({}));
      window.removeEventListener('message', null);
    }
  };

  /**
   * fetchSecureDetails
   * fetches the 3D secure details
   */
  const fetchSecureDetails = async () => {
    try {
      const fetchPaymentDetails = isTrialEligible ? retrieveSetupIntent : retrievePaymentIntent;
      const paymentDetails = await fetchPaymentDetails();
      loadSecureDetails(paymentDetails.next_action.redirect_to_url.url);
      setOpen(() => {
        // attempting 3ds, because state changes doesn't work with window listeners
        modalRef.current = 'active';
        return true;
      });
      window.addEventListener('message', (ev) => {
        if (ev.data === '3DS-authentication-complete') {
          on3DSComplete();
        }
      }, false);
    } catch (e) {
      // TODO: log the error to segment
      throw new Error(`Error loading 3D secure details): ${e.message}`);
    }
  };

  useEffect(() => {
    if (status === 'requires_action') {
      fetchSecureDetails();
    } else if (status === 'requires_payment_method') {
      // clear the stripe elements and ask user to submit new details
      // 3DS failed, prompt the customer to re-enter payment details
      const paymentElement = elements.getElement(PaymentElement);
      paymentElement.clear();
      paymentElement.focus();
    }

    if (status !== 'requires_action' && isOpen) {
      // hide the modal for all other states
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!isOpen || !stripe || !elements) { return null; }

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
  }),
  elements: PropTypes.shape({
    clear: () => {},
    focus: () => {},
    getElement: () => {},
  }),
};

Secure3DModal.defaultProps = {
  stripe: null,
  elements: null,
};

export default Secure3DModal;
