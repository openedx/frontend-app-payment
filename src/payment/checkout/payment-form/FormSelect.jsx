import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './PaymentForm.messages';

// eslint-disable-next-line object-curly-newline
const FormSelect = ({
  input,
  id,
  options,
  disabled,
  intl,
  meta: { touched, error },
  ...other
}) => (
  <>
    <select
      {...other}
      {...input}
      className="form-control"
      id={id}
      disabled={disabled}
    >
      {options}
    </select>
    {touched && error && <span className="text-danger">{messages[error] ? intl.formatMessage(messages[error]) : error}</span>}
  </>
);

FormSelect.propTypes = {
  input: PropTypes.shape({}).isRequired,
  id: PropTypes.string.isRequired,
  options: PropTypes.node.isRequired,
  disabled: PropTypes.bool.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool.isRequired,
    error: PropTypes.string,
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(FormSelect);
