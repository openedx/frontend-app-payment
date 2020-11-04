import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { StatefulButton } from '@edx/paragon';

import { getCardTypeId, CARD_TYPES } from './utils/credit-card';
import CardDetails from './CardDetails';
import CardHolderInformation from './CardHolderInformation';
import getStates from './utils/countryStatesMap';
import { updateCaptureKeySelector, updateSubmitErrorsSelector } from '../../data/selectors';
import { markPerformanceIfAble, getPerformanceProperties } from '../../performanceEventing';
import { ErrorFocusContext } from './contexts';

const CardValidator = require('../card-validator');

export class PaymentFormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      firstErrorId: null,
      shouldFocusFirstError: false,
    };
  }

  componentDidMount() {
    markPerformanceIfAble('Payment Form component rendered');
    sendTrackEvent(
      'edx.bi.ecommerce.payment_mfe.payment_form_rendered',
      getPerformanceProperties(),
    );
  }

  componentDidUpdate() {
    this.focusFirstError();
  }

  onSubmit = (values) => {
    // istanbul ignore if
    if (this.props.disabled) { return; }
    this.setState({ shouldFocusFirstError: true });
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
      purchasedForOrganization,
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

    let cardTypeId = null;
    if (false /* !this.props.flexMicroformEnabled */) { // eslint-disable-line no-constant-condition
      cardTypeId = getCardTypeId(cardNumber);
    }

    this.props.onSubmitPayment({
      cardHolderInfo: {
        firstName,
        lastName,
        address,
        unit,
        city,
        country,
        state,
        postalCode,
        organization,
        purchasedForOrganization,
      },
      cardDetails: {
        cardNumber,
        cardTypeId,
        securityCode,
        cardExpirationMonth,
        cardExpirationYear,
      },
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

    let requiredFields = {
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

    if (this.props.isPaymentVisualExperiment) {
      requiredFields = {
        firstName,
        lastName,
        city,
        country,
        cardNumber,
        securityCode,
        cardExpirationMonth,
        cardExpirationYear,
      };
    }

    if (true /* this.props.flexMicroformEnabled */) { // eslint-disable-line no-constant-condition
      requiredFields = {
        firstName,
        lastName,
        address,
        city,
        country,
        cardExpirationMonth,
        cardExpirationYear,
      };
    }

    if (getStates(country) && !this.props.isPaymentVisualExperiment) {
      requiredFields.state = state;
    }

    if (this.props.isBulkOrder) {
      requiredFields.organization = organization;
    }

    return requiredFields;
  }

  validateCardDetails(cardNumber, securityCode, cardExpirationMonth, cardExpirationYear) {
    const errors = {};

    if (false /* !this.props.flexMicroformEnabled */) { // eslint-disable-line no-constant-condition
      const { card, isValid } = CardValidator.number(cardNumber);
      if (cardNumber) {
        if (!isValid) {
          errors.cardNumber = 'payment.form.errors.invalid.card.number';
        } else {
          if (!Object.keys(CARD_TYPES).includes(card.type)) {
            errors.cardNumber = 'payment.form.errors.unsupported.card';
          }
          if (securityCode && securityCode.length !== card.code.size) {
            errors.securityCode = 'payment.form.errors.invalid.security.code';
          }
        }
      }
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    if (
      cardExpirationMonth
      && parseInt(cardExpirationMonth, 10) < currentMonth
      && parseInt(cardExpirationYear, 10) === currentYear
    ) {
      errors.cardExpirationMonth = 'payment.form.errors.card.expired';
    }

    return errors;
  }

  validateRequiredFields(values) {
    const errors = {};

    Object.keys(values).forEach((key) => {
      if (!values[key]) {
        errors[key] = 'payment.form.errors.required.field';
      }
    });

    return errors;
  }

  focusFirstError() {
    if (
      this.state.shouldFocusFirstError
      && Object.keys(this.props.submitErrors).length > 0
    ) {
      const form = this.formRef.current;
      const elementSelectors = Object.keys(this.props.submitErrors).map((fieldName) => `[id=${fieldName}]`);
      const firstElementWithError = form.querySelector(elementSelectors.join(', '));
      if (firstElementWithError) {
        if (['input', 'select'].includes(firstElementWithError.tagName.toLowerCase())) {
          firstElementWithError.focus();
          this.setState({ shouldFocusFirstError: false, firstErrorId: null });
        } else if (this.state.firstErrorId !== firstElementWithError.id) {
          this.setState({
            firstErrorId: firstElementWithError.id,
          });
        }
      }
    }
  }

  render() {
    const {
      handleSubmit,
      loading,
      disabled,
      isProcessing,
      isBulkOrder,
      isQuantityUpdating,
      isPaymentVisualExperiment,
      // flexMicroformEnabled,
    } = this.props;

    let submitButtonState = 'default';
    // istanbul ignore if
    if (disabled) { submitButtonState = 'disabled'; }
    // istanbul ignore if
    if (isProcessing) { submitButtonState = 'processing'; }
    return (
      <ErrorFocusContext.Provider value={this.state.firstErrorId}>
        <form
          onSubmit={handleSubmit(this.onSubmit)}
          ref={this.formRef}
          noValidate
        >
          <CardHolderInformation
            showBulkEnrollmentFields={isBulkOrder}
            disabled={disabled}
            isPaymentVisualExperiment={isPaymentVisualExperiment}
          />
          <CardDetails
            disabled={disabled}
            isPaymentVisualExperiment={isPaymentVisualExperiment}
          />
          <div className="row justify-content-end">
            <div className="col-lg-6 form-group">
              {
                loading || isQuantityUpdating || (true /* flexMicroformEnabled */ && !window.microform) ? (
                  <div className="skeleton btn btn-block btn-lg rounded-pill">&nbsp;</div>
                ) : (
                  <StatefulButton
                    type="submit"
                    id="placeOrderButton"
                    className="btn btn-primary btn-lg btn-block"
                    state={submitButtonState}
                    onClick={this.props.onSubmitButtonClick}
                    labels={{
                      default: (
                        <FormattedMessage
                          id="payment.form.submit.button.text"
                          defaultMessage="Place Order"
                          description="The label for the payment form submit button"
                        />
                      ),
                    }}
                    icons={{
                      processing: (
                        <span className="button-spinner-icon" />
                      ),
                    }}
                    disabledStates={['processing', 'disabled']}
                  />
                )
              }
            </div>
          </div>
        </form>
      </ErrorFocusContext.Provider>
    );
  }
}

PaymentFormComponent.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isProcessing: PropTypes.bool,
  isBulkOrder: PropTypes.bool,
  isQuantityUpdating: PropTypes.bool,
  isPaymentVisualExperiment: PropTypes.bool,
  loading: PropTypes.bool,
  onSubmitPayment: PropTypes.func.isRequired,
  onSubmitButtonClick: PropTypes.func.isRequired,
  // flexMicroformEnabled: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  submitErrors: PropTypes.objectOf(PropTypes.string),
};

PaymentFormComponent.defaultProps = {
  disabled: false,
  loading: true,
  isBulkOrder: false,
  isQuantityUpdating: false,
  isProcessing: false,
  isPaymentVisualExperiment: false,
  // flexMicroformEnabled: true,
  submitErrors: {},
};

const mapStateToProps = (state) => {
  const newProps = {
    ...updateCaptureKeySelector(state),
    ...updateSubmitErrorsSelector('payment')(state),
  };
  return newProps;
};

// The key `form` here needs to match the key provided to
// combineReducers when setting up the form reducer.
export default reduxForm({ form: 'payment' })(connect(mapStateToProps)(injectIntl(PaymentFormComponent)));
