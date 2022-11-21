import getStates from './countryStatesMap';

// eslint-disable-next-line import/prefer-default-export
export function isPostalCodeRequired(selectedCountry) {
  const countryListRequiredPostalCode = ['CA', 'GB', 'US'];
  const postalCodeRequired = countryListRequiredPostalCode.includes(selectedCountry);

  return postalCodeRequired;
}

export function getRequiredFields(fieldValues, isBulkOrder = false, enableStripePaymentProcessor = false) {
  const {
    firstName,
    lastName,
    address,
    city,
    country,
    state,
    postalCode,
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
  };

  if (!enableStripePaymentProcessor) {
    requiredFields.cardExpirationMonth = cardExpirationMonth;
    requiredFields.cardExpirationYear = cardExpirationYear;
  }

  if (isPostalCodeRequired(country) && enableStripePaymentProcessor) {
    requiredFields.postalCode = postalCode;
  }

  if (getStates(country)) {
    requiredFields.state = state;
  }

  if (isBulkOrder) {
    requiredFields.organization = organization;
  }

  return requiredFields;
}

export function validateAsciiNames(firstName, lastName) {
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

export function validateRequiredFields(values) {
  const errors = {};

  Object.keys(values).forEach((key) => {
    if (!values[key]) {
      errors[key] = 'payment.form.errors.required.field';
    }
  });

  return errors;
}

export function validateCardDetails(cardExpirationMonth, cardExpirationYear) {
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
