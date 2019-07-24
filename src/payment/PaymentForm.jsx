import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from '@edx/frontend-i18n';
import { sendTrackEvent } from '@edx/frontend-analytics';

import { submitPaymentCybersource } from './cybersource';
import { paymentSelector } from './data/selectors';

import { getCardTypeId, SUPPORTED_CARDS } from './utils/credit-card';
import CardDetails from './CardDetails';
import CardHolderInformation from './CardHolderInformation';
import getStates from './data/countryStatesMap';
import messages from './PaymentForm.messages';
import { ORDER_TYPES } from './data/constants';

const CardValidator = require('card-validator');

export class PaymentFormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
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
      organization,
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
      const firstErrorName = Object.keys(errors)[0];
      this.scrollToError(firstErrorName);
      throw new SubmissionError(errors);
    }

    this.props.submitPaymentCybersource({
      firstName,
      lastName,
      address,
      unit,
      city,
      country,
      state,
      postalCode,
      organization,
    }, {
      cardNumber,
      cardTypeId: getCardTypeId(cardNumber),
      securityCode,
      cardExpirationMonth,
      cardExpirationYear,
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
      organization,
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

    if (this.props.orderType === ORDER_TYPES.BULK_ENROLLMENT) {
      requiredFields.organization = organization;
    }

    return requiredFields;
  }

  handleSubmitButtonClick() {
    // TO DO: after event parity, track data should be
    // sent only if the payment is processed, not on click
    // Check for Paypal, ApplePay and Free Basket as well
    sendTrackEvent(
      'edx.bi.ecommerce.basket.payment_selected',
      {
        type: 'click',
        category: 'checkout',
        paymentMethod: 'Credit Card',
        checkoutType: 'client_side',
      },
    );
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
      }
    });

    return errors;
  }

  scrollToError(error) {
    const form = this.formRef.current;
    const formElement = form.querySelector(`[name=${error}]`);
    /* istanbul ignore else */
    if (formElement) {
      const elementParent = formElement.parentElement;
      elementParent.scrollIntoView(true);
    }
  }

  render() {
    const {
      handleSubmit,
      submitting,
      orderType,
    } = this.props;

    return (
      <form
        onSubmit={handleSubmit(this.onSubmit)}
        ref={this.formRef}
        noValidate
      >
        <CardHolderInformation
          submitting={submitting}
          showBulkEnrollmentFields={orderType === ORDER_TYPES.BULK_ENROLLMENT}
        />
        <CardDetails submitting={submitting} />
        <div className="row justify-content-end">
          <div className="col-lg-6 form-group">
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={submitting} onClick={this.handleSubmitButtonClick}>
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
  submitPaymentCybersource: PropTypes.func.isRequired,
  orderType: PropTypes.oneOf(Object.values(ORDER_TYPES)),
};

PaymentFormComponent.defaultProps = {
  submitting: false,
  orderType: ORDER_TYPES.SEAT,
};

// The key `form` here needs to match the key provided to
// combineReducers when setting up the form reducer.
export default reduxForm({ form: 'payment' })(connect(paymentSelector, {
  submitPaymentCybersource,
})(injectIntl(PaymentFormComponent)));
