// eslint-disable-next-line import/no-extraneous-dependencies
import { State } from 'country-state-city';

export const getCountryStatesMap = (country) => {
  const states = State.getStatesOfCountry(country);

  if (!states.length) {
    return null;
  }
  const statesMap = {};
  states.forEach((state) => {
    statesMap[state.isoCode] = state.name;
  });
  return country && statesMap;
};

// eslint-disable-next-line import/prefer-default-export
export function isPostalCodeRequired(selectedCountry) {
  // Stripe recommends to have state and zip code required since it can have a material effect on
  // our card authorization rates and fees that the card networks and issuers charge.
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

  // By using the country-state-city library to populate states, every country that
  //  has states from the ISO 3166-2 list will have states as a required field
  if (getCountryStatesMap(country)) {
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

export function validateCountryPaymentMethodCompatibility(
  isDynamicPaymentMethodsEnabled,
  stripeSelectedPaymentMethod,
  selectedCountry,
) {
  const errors = {};

  // Only adding country validation on the form level for BNPL Affirm.
  // For Klarna, there is validation on the Stripe API level,
  // which is handled with error code 'dynamic-payment-methods-country-not-compatible'
  if (isDynamicPaymentMethodsEnabled && stripeSelectedPaymentMethod === 'affirm') {
    const countryListCompatibleAffirm = ['US']; // leaving this is as list in case in the future we have Canada business compatibility
    if (!countryListCompatibleAffirm.includes(selectedCountry)) {
      errors.country = 'payment.form.errors.dynamic_payment_methods_not_compatible.country';
    }
  }

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
