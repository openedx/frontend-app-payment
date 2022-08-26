import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './PaymentForm.messages';

// eslint-disable-next-line object-curly-newline
function FormSelect({
  input,
  id,
  options,
  disabled,
  intl,
  meta: { touched, error },
  ...other
}) {
  const errorData = {};
  if (touched && error) {
    errorData['aria-describedby'] = `${id}-error`;
    errorData['aria-invalid'] = 'true';
  }
  return (
    <>
      <select
        {...other}
        {...input}
        className="form-control"
        id={id}
        disabled={disabled}
        {...errorData}
        style={{ MozAppearance: 'none', WebkitAppearance: 'none' }}
      >
        {options}
      </select>
      {touched && error && <span id={`${id}-error`} className="text-danger">{messages[error] ? intl.formatMessage(messages[error]) : error}</span>}
    </>
  );
}

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
