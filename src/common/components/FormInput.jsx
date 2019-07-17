import React from 'react';
import PropTypes from 'prop-types';

// eslint-disable-next-line object-curly-newline
const FormInput = ({ input, type, disabled, meta: { touched, error } }) => (
  <React.Fragment>
    <input {...input} type={type} className="form-control" disabled={disabled} />
    {touched && error && <span className="text-danger">{error}</span>}
  </React.Fragment>
);

FormInput.propTypes = {
  input: PropTypes.shape({}).isRequired,
  type: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool.isRequired,
    error: PropTypes.string,
  }).isRequired,
};

export default FormInput;
