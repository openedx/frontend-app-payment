import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AlertMessage from './AlertMessage';
import { alertListMapStateToProps } from './data/selectors';
import { removeMessage } from './data/actions';
import FallbackErrorMessage from './FallbackErrorMessage';

class AlertList extends Component {
  getUserMessage(code, userMessage) {
    if (this.props.messageCodes[code]) {
      return this.props.messageCodes[code];
    } else if (code === 'fallback-error') {
      return FallbackErrorMessage;
    }
    return userMessage;
  }

  render() {
    if (this.props.messageList.length < 1) {
      return null;
    }

    return this.props.messageList.map(({ code, userMessage, ...messageProps }) => (
      <AlertMessage
        {...messageProps}
        key={messageProps.id}
        closeHandler={this.props.removeMessage}
        userMessage={this.getUserMessage(code, userMessage)}
      />
    ));
  }
}

AlertList.propTypes = {
  messageList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    messageType: PropTypes.string.isRequired,
    code: PropTypes.string,
    userMessage: PropTypes.string,
    fieldName: PropTypes.string,
    data: PropTypes.object,
  })),
  removeMessage: PropTypes.func.isRequired,
  messageCodes: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ])),
};

AlertList.defaultProps = {
  messageList: [],
  messageCodes: {},
};

export default connect(
  alertListMapStateToProps,
  {
    removeMessage,
  },
)(AlertList);
