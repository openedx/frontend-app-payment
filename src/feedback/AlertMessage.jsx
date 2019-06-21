import React from 'react';
import PropTypes from 'prop-types';
import { StatusAlert } from '@edx/paragon';

const AlertMessage = (props) => {
  const {
    id, severity, message, closeHandler,
  } = props;

  const onClose = () => {
    closeHandler(id);
  };

  return <StatusAlert open alertType={severity} dialog={message} onClose={onClose} />;
};

AlertMessage.propTypes = {
  id: PropTypes.number.isRequired,
  severity: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  closeHandler: PropTypes.func.isRequired,
};

export default AlertMessage;
