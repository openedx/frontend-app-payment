import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { StatefulButton } from '@edx/paragon';

function PlaceOrderButton({
  showLoadingButton, onSubmitButtonClick, disabled, isProcessing,
}) {
  let submitButtonState = 'default';
  // istanbul ignore if
  if (disabled) { submitButtonState = 'disabled'; }
  // istanbul ignore if
  if (isProcessing) { submitButtonState = 'processing'; }

  return (
    <div className="col-lg-6 form-group float-right">
      <div className="row justify-content-end mt-4">
        {
        showLoadingButton ? (
          <div className="skeleton btn btn-block btn-lg">&nbsp;</div>
        ) : (
          <StatefulButton
            type="submit"
            id="placeOrderButton"
            variant="primary"
            size="lg"
            block
            state={submitButtonState}
            onClick={onSubmitButtonClick}
            labels={{
              default: (
                <FormattedMessage
                  id="payment.form.submit.button.text"
                  defaultMessage="Place Order"
                  description="The label for the payment form submit button"
                />
              ),
            }}
            icons={{
              processing: (
                <span className="button-spinner-icon" />
              ),
            }}
            disabledStates={['processing', 'disabled']}
          />
        )
    }
      </div>
    </div>
  );
}

PlaceOrderButton.propTypes = {
  onSubmitButtonClick: PropTypes.func.isRequired,
  showLoadingButton: PropTypes.bool,
  disabled: PropTypes.bool,
  isProcessing: PropTypes.bool,
};

PlaceOrderButton.defaultProps = {
  showLoadingButton: false,
  disabled: false,
  isProcessing: false,
};

export default injectIntl(PlaceOrderButton);
