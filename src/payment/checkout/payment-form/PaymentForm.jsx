import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { injectIntl } from '@edx/frontend-platform/i18n';

import CardDetails from './CardDetails';
import CardHolderInformation from './CardHolderInformation';
import PlaceOrderButton from './PlaceOrderButton';
import getStates from './utils/countryStatesMap';
import { updateCaptureKeySelector, updateSubmitErrorsSelector } from '../../data/selectors';
import { fetchCaptureKey } from '../../data/actions';
import { markPerformanceIfAble, getPerformanceProperties } from '../../performanceEventing';
import { ErrorFocusContext } from './contexts';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

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
    this.props.fetchCaptureKey();
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
      cardExpirationMonth,
      cardExpirationYear,
      organization,
      purchasedForOrganization,
    } = values;

    const errors = {
      ...this.validateRequiredFields(requiredFields),
      ...this.validateAsciiNames(
        firstName,
        lastName,
      ),
      ...this.validateCardDetails(
        cardExpirationMonth,
        cardExpirationYear,
      ),
    };

    if (Object.keys(errors).length > 0) {
      throw new SubmissionError(errors);
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
      cardExpirationMonth,
      cardExpirationYear,
    };

    if (getStates(country)) {
      requiredFields.state = state;
    }

    if (this.props.isBulkOrder) {
      requiredFields.organization = organization;
    }

    return requiredFields;
  }

  validateCardDetails(cardExpirationMonth, cardExpirationYear) {
    const errors = {};

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

  validateAsciiNames(firstName, lastName) {
    const errors = {};

    if (
      firstName
      && lastName
      && !/[A-Za-z]/.test(firstName + lastName)
    ) {
      errors.firstName = 'payment.form.errors.ascii.name';
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
      stripeEnabled,
    } = this.props;

    const showLoadingButton = loading || isQuantityUpdating || !window.microform;

    return (
      <ErrorFocusContext.Provider value={this.state.firstErrorId}>
        {stripeEnabled && options.clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <StripeCardPayment clientSecret={options.clientSecret} />
            {/* onSubmitButtonClick={this.props.onSubmitButtonClick}
            onSubmitPayment={this.props.onSubmitPayment} */}
          </Elements>
        )}

        {!stripeEnabled && (
        <form
          onSubmit={handleSubmit(this.onSubmit)}
          ref={this.formRef}
          noValidate
        >
          <CardHolderInformation
            showBulkEnrollmentFields={isBulkOrder}
            disabled={disabled}
          />
          <CardDetails
            disabled={disabled}
          />
          <PlaceOrderButton
            onSubmitButtonClick={this.props.onSubmitButtonClick}
            showLoadingButton={showLoadingButton}
            disabled={disabled}
            isProcessing={isProcessing}
          />
        </form>
        )}
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
  loading: PropTypes.bool,
  onSubmitPayment: PropTypes.func.isRequired,
  onSubmitButtonClick: PropTypes.func.isRequired,
  submitErrors: PropTypes.objectOf(PropTypes.string),
  fetchCaptureKey: PropTypes.func.isRequired,
};

PaymentFormComponent.defaultProps = {
  disabled: false,
  loading: true,
  isBulkOrder: false,
  isQuantityUpdating: false,
  isProcessing: false,
  submitErrors: {},
  captureKeyId: null,
  stripeEnabled: true,
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
export default reduxForm({ form: 'payment' })(connect(
  mapStateToProps,
  {
    fetchCaptureKey,
  },
)(injectIntl(PaymentFormComponent)));
