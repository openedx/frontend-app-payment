import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';

import { StatefulButton, Icon } from '@edx/paragon';
import { Check as CheckIcon } from '@edx/paragon/icons';
import { subscriptionStatusSelector } from '../../data/status/selectors';

const SubscriptionSubmitButton = ({
  showLoadingButton, onSubmitButtonClick, disabled, isProcessing,
}) => {
  const { status } = useSelector(subscriptionStatusSelector);
  let submitButtonState = 'default';
  if (disabled) { submitButtonState = 'disabled'; }
  if (isProcessing) { submitButtonState = 'processing'; }
  // handle submitted state
  if (status === 'trialing' || status === 'success') { submitButtonState = 'success'; }

  return (
    <div className="col-lg-7 col-xl-6 form-group float-right">
      <div className="row justify-content-end mt-4">
        {
        showLoadingButton ? (
          <div className="skeleton btn btn-block btn-lg">&nbsp;</div>
        ) : (
          <StatefulButton
            type="submit"
            id="placeOrderButton"
            variant={(status === 'success' || status === 'trialing') ? 'success' : 'brand'}
            size="md"
            block
            state={submitButtonState}
            onClick={onSubmitButtonClick}
            labels={{
              default: (
                <FormattedMessage
                  id="subscription.checkout.form.submit.button.text.default"
                  defaultMessage="Subscribe"
                  description="The label for the subscription form submit button"
                />
              ),
              success: (
                <FormattedMessage
                  id="subscription.checkout.form.submit.button.text.resubscribe"
                  defaultMessage="Subscription started"
                  description="The button label for the resubscribe subscription."
                />
              ),
            }}
            icons={{
              processing: (
                <span className="button-spinner-icon" />
              ),
              success: (
                <Icon src={CheckIcon} />
              ),
            }}
            disabledStates={['processing', 'disabled']}
          />
        )
    }
      </div>
    </div>
  );
};

SubscriptionSubmitButton.propTypes = {
  onSubmitButtonClick: PropTypes.func.isRequired,
  showLoadingButton: PropTypes.bool,
  disabled: PropTypes.bool,
  isProcessing: PropTypes.bool,
};

SubscriptionSubmitButton.defaultProps = {
  showLoadingButton: false,
  disabled: false,
  isProcessing: false,
};

export default SubscriptionSubmitButton;
