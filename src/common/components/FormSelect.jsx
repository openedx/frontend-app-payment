import React from 'react';
import PropTypes from 'prop-types';

// eslint-disable-next-line object-curly-newline
const FormSelect = ({ input, options, meta: { touched, error } }) => (
  <React.Fragment>
    <select {...input} className="form-control">
      {options}
    </select>
    {touched && error && <span className="text-danger">{error}</span>}
  </React.Fragment>
);

FormSelect.propTypes = {
  input: PropTypes.shape({}).isRequired,
  options: PropTypes.node.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool.isRequired,
    error: PropTypes.bool,
  }).isRequired,
};

export default FormSelect;
