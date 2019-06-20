import React from 'react';
import PropTypes from 'prop-types';

const FormInput = ({ input, type, meta: { touched, error } }) => (
  <React.Fragment>
    <input {...input} type={type} className="form-control" />
    {touched && error && <span className="text-danger">{error}</span>}
  </React.Fragment>
);

FormInput.propTypes = {
  input: PropTypes.shape({}).isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool.isRequired,
    error: PropTypes.bool,
  }).isRequired,
};

export default FormInput;
