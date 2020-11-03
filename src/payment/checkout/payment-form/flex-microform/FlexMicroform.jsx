import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logError } from '@edx/frontend-platform/logging';
import CreditCardNumberField from './CreditCardNumberField';
import CreditCardVerificationNumberField from './CreditCardVerificationNumberField';
import { DEFAULT_STATUS, STATUS_READY } from './constants';
import { microformStatus } from '../../../data/actions';

// Selectors
import { updateCaptureKeySelector } from '../../../data/selectors';

class FlexMicroform extends React.Component {
  constructor(props) {
    super(props);

    window.microform = null;
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
    const styles = {
      styles: {
        input: {
          'font-size': '16px',
          'font-family': 'Roboto, "Helvetica Neue", Arial, sans-serif',
          color: '#2d323e',
        },
      },
    };
    try {
      window.microform = new window.Flex(captureKeyId).microform(styles);
    } catch (err) {
      if (err.reason && err.reason === 'CAPTURE_CONTEXT_EXPIRED') {
        const realDateNow = Date.now;
        try {
          const jwtPayloadStr = captureKeyId.split('.')[1];
          const parsedJwt = atob(jwtPayloadStr.replace(/-/g, '+').replace(/_/g, '/'));
          Date.now = function () {
            return parsedJwt.iat * 1000;
          };
          window.microform = new window.Flex(captureKeyId).microform(styles);
        } catch (err1) {
          logError(err1, {
            messagePrefix: 'Cybersource FlexMicroform Rescue Attempt Error',
            paymentMethod: 'Cybersource',
            paymentErrorType: 'Checkout',
            captureKeyId,
          });
        } finally {
          Date.now = realDateNow;
        }
        if (window.microform === null) {
          throw err;
        }
      } else {
        throw err;
      }
    }
    this.props.dispatch(microformStatus(STATUS_READY));
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
