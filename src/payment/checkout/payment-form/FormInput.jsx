import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './PaymentForm.messages';

// eslint-disable-next-line object-curly-newline
const FormInput = ({
  input,
  id,
  type,
  disabled,
  intl,
  meta: { touched, error },
  ...other
}) => {
  const errorData = {};
  if (touched && error) {
    errorData['aria-describedby'] = `${id}-error`;
    errorData['aria-invalid'] = 'true';
  }
  return (
    <>
      <input
        {...errorData}
        {...other}
        {...input}
        type={type}
        className={classNames('form-control', { error })}
        id={id}
        disabled={disabled}
      />
      {touched && error && <span id={`${id}-error`} className="text-danger">{messages[error] ? intl.formatMessage(messages[error]) : error}</span>}
    </>
  );
};

FormInput.propTypes = {
  input: PropTypes.shape({}).isRequired,
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  meta: PropTypes.shape({
    touched: PropTypes.bool.isRequired,
    error: PropTypes.string,
  }).isRequired,
  intl: intlShape.isRequired,
};

FormInput.defaultProps = {
  disabled: false,
};

export default injectIntl(FormInput);
