import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logError } from '@edx/frontend-platform/logging';
import CreditCardNumberField from './CreditCardNumberField';
import CreditCardVerificationNumberField from './CreditCardVerificationNumberField';
import { DEFAULT_STATUS, STATUS_READY } from './constants';
import { microformStatus, fetchCaptureKey, captureKeyProcessing } from '../../../data/actions';

// Selectors
import { updateCaptureKeySelector } from '../../../data/selectors';

class FlexMicroform extends React.Component {
  constructor(props) {
    super(props);

    window.microform = null;
    this.captureContextRetryCount = 0;
  }

  componentDidMount() {
    if (this.props.captureKeyId) {
      this.initialize(this.props.captureKeyId);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.captureKeyId && prevProps.captureKeyId !== this.props.captureKeyId) {
      this.initialize(this.props.captureKeyId);
    }
  }

  initialize = (captureKeyId) => {
    if (typeof window.Flex === 'undefined') {
      logError(new Error('Unable to initialize Cybersource FlexMicroform'), {
        messagePrefix: 'Cybersource FlexMicroform Error',
        paymentMethod: 'Cybersource',
        paymentErrorType: 'Checkout',
      });
      return;
    }
    try {
      window.microform = new window.Flex(captureKeyId).microform({
        styles: {
          input: {
            'font-size': '16px',
            'font-family': 'Roboto, "Helvetica Neue", Arial, sans-serif',
            color: '#2d323e',
          },
        },
      });
      this.props.dispatch(microformStatus(STATUS_READY));
    } catch (err) {
      if (err.reason && err.reason === 'CAPTURE_CONTEXT_EXPIRED' && this.state.captureContextRetryCount < 5) {
        this.state.captureContextRetryCount++;
        logError(err, {
          messagePrefix: 'Cybersource FlexMicroform CaptureContext Error',
          paymentMethod: 'Cybersource',
          paymentErrorType: 'Checkout',
          captureContextRetries: this.captureContextRetryCount,
          captureKeyId,
        });
        this.props.dispatch(captureKeyProcessing(false));
        this.props.dispatch(fetchCaptureKey());
      } else {
        throw err;
      }
    }
  };

  render() {
    return (
      <div className="row">
        <CreditCardNumberField
          microformStatus={this.props.microformStatus}
          disabled={this.props.disabled}
        />
        <CreditCardVerificationNumberField
          microformStatus={this.props.microformStatus}
          disabled={this.props.disabled}
        />
      </div>
    );
  }
}

FlexMicroform.propTypes = {
  captureKeyId: PropTypes.string,
  microformStatus: PropTypes.string,
  disabled: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
};

FlexMicroform.defaultProps = {
  captureKeyId: null,
  microformStatus: DEFAULT_STATUS,
  disabled: false,
};

export default connect(
  updateCaptureKeySelector,
)(FlexMicroform);
