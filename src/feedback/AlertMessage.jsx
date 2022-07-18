import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { StatusAlert } from '@edx/paragon';
import { ALERT_TYPES, MESSAGE_TYPES } from './data/constants';

// Put in a message type, get an alert type.
const severityMap = {
  [MESSAGE_TYPES.DEBUG]: ALERT_TYPES.WARNING,
  [MESSAGE_TYPES.INFO]: ALERT_TYPES.INFO,
  [MESSAGE_TYPES.SUCCESS]: ALERT_TYPES.SUCCESS,
  [MESSAGE_TYPES.WARNING]: ALERT_TYPES.WARNING,
  [MESSAGE_TYPES.ERROR]: ALERT_TYPES.DANGER,
};

const AlertMessage = (props) => {
  const {
    id, messageType, userMessage, closeHandler, data,
  } = props;

  const statusAlertProps = {
    alertType: ALERT_TYPES.WARNING,
    onClose: useCallback(() => { closeHandler(id); }),
    open: true,
  };

  if (messageType !== null && severityMap[messageType] !== undefined) {
    statusAlertProps.alertType = severityMap[messageType];
  }

  // The user message can be a
  // - React component definition (we must create it with props)
  // - React element instance (we must clone it with props)
  // - A string or number (we will render this as is)
  if (typeof userMessage === 'function') {
    statusAlertProps.dialog = React.createElement(userMessage, { values: data });
  } else if (React.isValidElement(userMessage)) {
    statusAlertProps.dialog = React.cloneElement(userMessage, {
      ...userMessage.props,
      values: { ...data, ...userMessage.props.values },
    });
  } else {
    statusAlertProps.dialog = userMessage;
  }

  return <StatusAlert {...statusAlertProps} />;
};

AlertMessage.propTypes = {
  id: PropTypes.number.isRequired,
  messageType: PropTypes.string,
  userMessage: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  closeHandler: PropTypes.func.isRequired,
  data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

AlertMessage.defaultProps = {
  userMessage: null,
  messageType: undefined,
  data: {},
};

export default AlertMessage;
