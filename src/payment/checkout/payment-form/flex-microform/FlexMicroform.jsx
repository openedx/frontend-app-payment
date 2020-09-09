import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logError } from '@edx/frontend-platform/logging';
import CreditCardNumberField from './CreditCardNumberField';
import CreditCardVerificationNumberField from './CreditCardVerificationNumberField';
import { DEFAULT_STATUS, STATUS_READY } from './constants';

// Actions
import { fetchCaptureKey } from '../../../data/actions';

// Selectors
import { captureKeySelector } from '../../../data/selectors';

class FlexMicroform extends React.Component {
  constructor(props) {
    super(props);

    window.microform = null;
    this.state = {
      microformStatus: DEFAULT_STATUS,
    };
  }

  componentDidMount() {
    this.props.fetchCaptureKey();
    this.initialize();
  }

  componentDidUpdate() {
    this.initialize();
  }

  initialize = () => {
    // console.log({ "BJH: FlexForm props": this.props });

    if (window.microform !== null || !this.props.capture_context || !this.props.capture_context.key_id) {
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
    window.microform = new window.Flex(this.props.capture_context.key_id).microform({
      styles: {
        input: {
          'font-size': '16px',
          'font-family': 'Roboto, "Helvetica Neue", Arial, sans-serif',
          color: '#2d323e',
        },
      },
    });
    this.setState({
      microformStatus: STATUS_READY,
    });
  };

  render() {
    return (
      <div className="row">
        <CreditCardNumberField microformStatus={this.state.microformStatus} disabled={this.props.disabled} />
        <CreditCardVerificationNumberField
          microformStatus={this.state.microformStatus}
          disabled={this.props.disabled}
        />
      </div>
    );
  }
}

FlexMicroform.propTypes = {
  captureKeyId: PropTypes.string,
  disabled: PropTypes.bool,
};

FlexMicroform.defaultProps = {
  captureKeyId: null,
  disabled: false,
};

export default connect(
  captureKeySelector,
  {
    fetchCaptureKey,
  },
)(FlexMicroform);
