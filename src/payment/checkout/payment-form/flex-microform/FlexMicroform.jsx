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
    this.initialize();
  }

  componentDidUpdate(prevProps) {
    this.initialize(prevProps);
  }

  initialize = (prevProps = {}) => {
    if (!this.props.captureKeyId || prevProps.captureKeyId === this.props.captureKeyId) {
      return;
    }
    if (typeof window.Flex === 'undefined') {
      logError(new Error('Unable to initialize Cybersource FlexMicroform'), {
        messagePrefix: 'Cybersource FlexMicroform Error',
        paymentMethod: 'Cybersource',
        paymentErrorType: 'Checkout',
      });
      return;
    }
    console.log({ "New flex microform with key": this.props.captureKeyId });
    window.microform = new window.Flex(this.props.captureKeyId).microform({
      styles: {
        input: {
          'font-size': '16px',
          'font-family': 'Roboto, "Helvetica Neue", Arial, sans-serif',
          color: '#2d323e',
        },
      },
    });
    this.props.dispatch(microformStatus(STATUS_READY));
  };

  render() {
    return (
      <div className="row">
        <CreditCardNumberField
          microformStatus={this.state.microformStatus}
          disabled={this.props.disabled}
        />
        <CreditCardVerificationNumberField
          microformStatus={this.props.microformStatus}
          disabled={this.props.disabled}
          // captureKeyId={this.props.captureKeyId}
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
