import React from 'react';
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
    id, messageType, userMessage, closeHandler,
  } = props;

  const onClose = () => {
    closeHandler(id);
  };

  const severity =
    messageType !== null && severityMap[messageType] !== undefined
      ? severityMap[messageType]
      : ALERT_TYPES.WARNING;

  let dialog = userMessage;
  if (React.Children.count(props.children) > 0) {
    dialog = props.children;
  }
  return <StatusAlert open alertType={severity} dialog={dialog} onClose={onClose} />;
};

AlertMessage.propTypes = {
  id: PropTypes.number.isRequired,
  messageType: PropTypes.string.isRequired,
  userMessage: PropTypes.string,
  closeHandler: PropTypes.func.isRequired,
  children: PropTypes.node,
};

AlertMessage.defaultProps = {
  userMessage: null,
  children: null,
};

export default AlertMessage;
