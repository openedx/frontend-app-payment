import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-i18n';

import { submitPayment } from './data/actions';
import { paymentSelector } from './data/selectors';

import CardDetails, { SUPPORTED_CARDS } from './CardDetails';
import CardHolderInformation from './CardHolderInformation';
import getStates from './data/countryStatesMap';
import messages from './PaymentForm.messages';

const CardValidator = require('card-validator');

export class PaymentFormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  componentDidUpdate() {
    if (this.props.paymentProcessorUrl) {
      this.formRef.current.submit();
    }
  }

  onSubmit = (values) => {
    const requiredFields = this.getRequiredFields(values);
    const {
      firstName,
      lastName,
      address,
      unit,
      city,
      country,
      state,
      postalCode,
      cardNumber,
      securityCode,
      cardExpirationMonth,
      cardExpirationYear,
    } = values;

    const errors = {
      ...this.validateRequiredFields(requiredFields),
      ...this.validateCardDetails(
        cardNumber,
        securityCode,
        cardExpirationMonth,
        cardExpirationYear,
      ),
    };

    if (Object.keys(errors).length > 0) {
      throw new SubmissionError(errors);
    }

    this.props.submitPayment({
      firstName,
      lastName,
      address,
      unit,
      city,
      country,
      state,
      postalCode,
    });
  };

  getRequiredFields(fieldValues) {
    const {
      firstName,
      lastName,
      address,
      city,
      country,
      state,
      cardNumber,
      securityCode,
      cardExpirationMonth,
      cardExpirationYear,
    } = fieldValues;

    const requiredFields = {
      firstName,
      lastName,
      address,
      city,
      country,
      cardNumber,
      securityCode,
      cardExpirationMonth,
      cardExpirationYear,
    };
    if (getStates(country)) {
      requiredFields.state = state;
    }

    return requiredFields;
  }

  validateCardDetails(cardNumber, securityCode, cardExpirationMonth, cardExpirationYear) {
    const errors = {};

    const { card, isValid } = CardValidator.number(cardNumber);
    if (cardNumber) {
      if (!isValid) {
        errors.cardNumber = this.props.intl.formatMessage(messages['payment.form.errors.invalid.card.number']);
      } else {
        if (!Object.keys(SUPPORTED_CARDS).includes(card.type)) {
          errors.cardNumber = this.props.intl.formatMessage(messages['payment.form.errors.unsupported.card']);
        }
        if (securityCode && securityCode.length !== card.code.size) {
          errors.securityCode = this.props.intl.formatMessage(messages['payment.form.errors.invalid.security.code']);
        }
      }
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    if (
      cardExpirationMonth &&
      parseInt(cardExpirationMonth, 10) < currentMonth &&
      parseInt(cardExpirationYear, 10) === currentYear
    ) {
      errors.cardExpirationMonth = this.props.intl.formatMessage(messages['payment.form.errors.card.expired']);
    }

    return errors;
  }

  validateRequiredFields(values) {
    const errors = {};

    Object.keys(values).forEach((key) => {
      if (!values[key]) {
        errors[key] = this.props.intl.formatMessage(messages['payment.form.errors.required.field']);

        // scroll to error
        const formElement = document.getElementsByName(`${key}`);
        const topOfParent = formElement[0].offsetParent.offsetParent.offsetTop - 10;
        const topOfElement = formElement[0].offsetParent.offsetTop + topOfParent;
        window.scrollTo({
          top: topOfElement,
          left: 0,
          behavior: 'smooth',
        });
      }
    });

    return errors;
  }

  renderPaymentProviderFormFields() {
    const { paymentProcessorFormFields } = this.props;
    const formFields = [];
    Object.keys(paymentProcessorFormFields).forEach((key) => {
      formFields.push(<input type="hidden" key={key} name={key} value={paymentProcessorFormFields[key]} />);
    });
    return formFields;
  }

  render() {
    const {
      handleSubmit,
      submitting,
      paymentProcessorUrl,
    } = this.props;

    return (
      <form
        method="POST"
        action={paymentProcessorUrl}
        onSubmit={handleSubmit(this.onSubmit)}
        ref={this.formRef}
        noValidate
      >
        <CardHolderInformation submitting={submitting} />
        <CardDetails submitting={submitting} />
        {this.renderPaymentProviderFormFields()}
        <div className="row justify-content-end">
          <div className="col-lg-6 form-group">
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting}>
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

PaymentFormComponent.propTypes = {
  intl: intlShape.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  submitPayment: PropTypes.func.isRequired,
  paymentProcessorFormFields: PropTypes.shape({}),
  paymentProcessorUrl: PropTypes.string,
};

PaymentFormComponent.defaultProps = {
  submitting: false,
  paymentProcessorFormFields: {},
  paymentProcessorUrl: '',
};

// The key `form` here needs to match the key provided to
// combineReducers when setting up the form reducer.
export default reduxForm({ form: 'payment' })(connect(paymentSelector, {
  submitPayment,
})(injectIntl(PaymentFormComponent)));
