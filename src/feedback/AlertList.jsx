import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

import AlertMessage from './AlertMessage';
import { alertListMapStateToProps } from './data/selectors';
import { removeMessage } from './data/actions';

class AlertList extends Component {
  renderChild(message) {
    let child = null;
    React.Children.forEach(this.props.children, (element) => {
      if (element.props.code === message.code) {
        child = element;
      }
    });
    return (
      <AlertMessage key={message.id} {...message} closeHandler={this.props.removeMessage}>
        {child.props.children}
      </AlertMessage>
    );
  }

  render() {
    if (this.props.messageList.length < 1) {
      return null;
    }

    return this.props.messageList.map((message) => {
      const {
        id, code, userMessage, messageType, data,
      } = message;
      if (code != null) {
        return this.renderChild(message);
      }

      const formattedMessage =
        userMessage !== null
          ? userMessage
          : this.props.intl.formatMessage(
            this.props.intlMessages[`${this.props.messagePrefix}${code}`],
            data,
          );
      return (
        <AlertMessage
          key={id}
          id={id}
          userMessage={formattedMessage}
          messageType={messageType}
          closeHandler={this.props.removeMessage}
        />
      );
    });
  }
}

export class AlertMessageTemplate extends Component { // eslint-disable-line
  render() {
    return this.props.code;
  }
}

AlertMessageTemplate.propTypes = {
  code: PropTypes.string.isRequired,
};

AlertList.propTypes = {
  messagePrefix: PropTypes.string,
  children: PropTypes.element,
  messageList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    messageType: PropTypes.string.isRequired,
    code: PropTypes.string,
    userMessage: PropTypes.string,
    fieldName: PropTypes.string,
  })),
  removeMessage: PropTypes.func.isRequired,
  intlMessages: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  })).isRequired,
  intl: intlShape.isRequired,
};

AlertList.defaultProps = {
  messageList: [],
  messagePrefix: '',
  children: null,
};

export default connect(
  alertListMapStateToProps,
  {
    removeMessage,
  },
)(injectIntl(AlertList));
