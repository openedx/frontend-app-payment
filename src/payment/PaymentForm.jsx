import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { FormattedMessage } from '@edx/frontend-i18n';

import CardDetails from './CardDetails';
import CardHolderInformation from './CardHolderInformation';

class PaymentForm extends React.Component {
  onSubmit(values) {
    /* istanbul ignore next */
    alert(JSON.stringify(values)); // eslint-disable-line
  }

  render() {
    const { handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <CardHolderInformation />
        <CardDetails />

        <div className="row justify-content-end">
          <div className="col-lg-6 form-group">
            <button type="submit" className="btn btn-primary btn-lg btn-block">
              <FormattedMessage
                id="payment.form.submit.button.text"
                defaultMessage="Place Order"
                description="The label for the payment form submit button"
              />
            </button>
          </div>
        </div>
      </form>
    );
  }
}

PaymentForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

// The key `form` here needs to match the key provided to
// combineReducers when setting up the form reducer.
export default reduxForm({ form: 'payment' })(PaymentForm);
