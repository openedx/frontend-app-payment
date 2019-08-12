import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-i18n';
import { StatefulButton, Input } from '@edx/paragon';

import { updateQuantity } from '../data/actions';
import { updateQuantityFormSelector } from '../data/selectors';

function UpdateQuantityForm(props) {
  const id = 'code-quantity';

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    props.updateQuantity(e.target.elements[id].value);
  });

  return (
    <form
      className="summary-row form-inline"
      onSubmit={handleSubmit}
    >
      <div className="form-group mr-2">
        <label htmlFor={id}>
          <FormattedMessage
            id="payment.update.quantity.label"
            defaultMessage="Quantity"
            description="Label for updating a quantity of enrollment codes to purchase"
          />
        </label>
        <div className="position-relative">
          <Input
            className="form-control-sm"
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
            <FormattedMessage
              id="payment.update.quantity.field.help.text"
              defaultMessage="Max: {number}"
              description="Help text for updating a quantity of enrollment codes to purchase. Maximum 100 codes."
              values={{
                number: 100,
              }}
            />
          </small>
        </div>
      </div>
      <StatefulButton
        type="submit"
        state={props.isBasketProcessing ? 'pending' : 'default'}
        labels={{
          default: (
            <FormattedMessage
              id="payment.update.quantity.submit.button"
              defaultMessage="Update"
              description="Button for updating a quantity of enrollment codes to purchase."
            />
          ),
        }}
        className="btn-primary btn-sm"
      />
    </form>
  );
}

UpdateQuantityForm.propTypes = {
  updateQuantity: PropTypes.func.isRequired,
  summaryQuantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isBasketProcessing: PropTypes.bool,
};

UpdateQuantityForm.defaultProps = {
  summaryQuantity: undefined,
  isBasketProcessing: false,
};

export default connect(
  updateQuantityFormSelector,
  {
    updateQuantity,
  },
)(UpdateQuantityForm);
