import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StatefulButton, Input } from '@edx/paragon';

import { updateEnrollmentCodeQuantity } from './data/actions';
import { basketSelector } from './data/selectors';

function UpdateQuantityForm(props) {
  const id = 'code-quantity';

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    props.updateEnrollmentCodeQuantity(e.target.elements[id].value);
  });

  return (
    <form
      className="summary-row form-inline"
      onSubmit={handleSubmit}
    >
      <div className="form-group mr-2">
        <label htmlFor={id}>
          Quantity!!!
        </label>
        <div className="position-relative">
          <Input
            name={id}
            id={id}
            max="100"
            min="1"
            type="number"
            style={{ width: '5rem' }}
            defaultValue={props.summaryQuantity}
          />
          <small
            className="text-muted small"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
            }}
          >
            Max: 100
          </small>
        </div>
      </div>
      <StatefulButton
        type="submit"
        state={props.updatingQuantity ? 'pending' : 'default'}
        labels={{
          default: 'Update!',
          pending: 'Update!',
        }}
        className="btn-primary"
      />
    </form>
  );
}

UpdateQuantityForm.propTypes = {
  updateEnrollmentCodeQuantity: PropTypes.func.isRequired,
  summaryQuantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  updatingQuantity: PropTypes.bool,
};

UpdateQuantityForm.defaultProps = {
  summaryQuantity: undefined,
  updatingQuantity: false,
};

export default connect(
  basketSelector,
  {
    updateEnrollmentCodeQuantity,
  },
)(UpdateQuantityForm);
