import React from 'react';
import PropTypes from 'prop-types';
import CreditCardNumberField from './CreditCardNumberField';
import CreditCardVerificationNumberField from './CreditCardVerificationNumberField';
import { DEFAULT_STATUS, STATUS_READY } from './constants';

const POLLING_TIME_MS = 100;

class FlexMicroform extends React.Component {
  constructor(props) {
    super(props);

    window.microform = null;
    this.state = {
      microformStatus: DEFAULT_STATUS,
    };
    this.timer = null;
  }

  componentDidMount() {
    this.initialize();
  }

  componentDidUpdate() {
    this.initialize();
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  initialize = () => {
    if (window.microform !== null) {
      return;
    }
    if (!this.props.captureKeyId) {
      return;
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (typeof window.Flex === 'undefined') {
      this.timer = setTimeout(this.initialize, POLLING_TIME_MS);
      return;
    }
    window.microform = new window.Flex(this.props.captureKeyId).microform({
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

export default FlexMicroform;
