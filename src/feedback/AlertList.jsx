import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-i18n';

import AlertMessage from './AlertMessage';
import { alertListMapStateToProps } from './data/selectors';
import { removeMessage } from './data/actions';

class AlertList extends Component {
  render() {
    if (this.props.messageList.length < 1) {
      return null;
    }

    return this.props.messageList.map(({
      id, code, message, severity, data,
    }) => {
      const formattedMessage =
        message !== null
          ? message
          : this.props.intl.formatMessage(this.props.intlMessages[code], data);
      return (
        <AlertMessage
          key={id}
          id={id}
          message={formattedMessage}
          severity={severity}
          closeHandler={this.props.removeMessage}
        />
      );
    });
  }
}

AlertList.propTypes = {
  messageList: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    severity: PropTypes.string.isRequired,
    code: PropTypes.string,
    message: PropTypes.string,
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
};

export default connect(
  alertListMapStateToProps,
  {
    removeMessage,
  },
)(injectIntl(AlertList));
