import camelCase from 'lodash.camelcase';
import snakeCase from 'lodash.snakecase';
import { getConfig } from '@edx/frontend-platform';
import Cookies from 'universal-cookie';
import { ORDER_TYPES } from './constants';

export function modifyObjectKeys(object, modify) {
  // If the passed in object is not an object, return it.
  if (
    object === undefined
    || object === null
    || (typeof object !== 'object' && !Array.isArray(object))
  ) {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map(value => modifyObjectKeys(value, modify));
  }

  // Otherwise, process all its keys.
  const result = {};
  Object.entries(object).forEach(([key, value]) => {
    result[modify(key)] = modifyObjectKeys(value, modify);
  });
  return result;
}

export function camelCaseObject(object) {
  return modifyObjectKeys(object, camelCase);
}

export function snakeCaseObject(object) {
  return modifyObjectKeys(object, snakeCase);
}

export function convertKeyNames(object, nameMap) {
  const transformer = key => (nameMap[key] === undefined ? key : nameMap[key]);

  return modifyObjectKeys(object, transformer);
}

export function keepKeys(data, whitelist) {
  const result = {};
  Object.keys(data).forEach((key) => {
    if (whitelist.indexOf(key) > -1) {
      result[key] = data[key];
    }
  });
  return result;
}

/**
 * Given a state tree and an array representing a set of keys to traverse in that tree, returns
 * the portion of the tree at that key path.
 *
 * Example:
 *
 * const result = getModuleState(
 *   {
 *     first: { red: { awesome: 'sauce' }, blue: { weak: 'sauce' } },
 *     second: { other: 'data', }
 *   },
 *   ['first', 'red']
 * );
 *
 * result will be:
 *
 * {
 *   awesome: 'sauce'
 * }
 */
export function getModuleState(state, originalPath) {
  const path = [...originalPath]; // don't modify your argument
  if (path.length < 1) {
    return state;
  }
  const key = path.shift();
  if (state[key] === undefined) {
    throw new Error(`Unexpected state key ${key} given to getModuleState. Is your state path set up correctly?`);
  }
  return getModuleState(state[key], path);
}

/**
 * Helper class to save time when writing out action types for asynchronous methods.  Also helps
 * ensure that actions are namespaced.
 *
 * TODO: Put somewhere common to it can be used by other MFEs.
 */
export class AsyncActionType {
  constructor(topic, name) {
    this.topic = topic;
    this.name = name;
  }

  get BASE() {
    return `${this.topic}__${this.name}`;
  }

  get BEGIN() {
    return `${this.topic}__${this.name}__BEGIN`;
  }

  get SUCCESS() {
    return `${this.topic}__${this.name}__SUCCESS`;
  }

  get FAILURE() {
    return `${this.topic}__${this.name}__FAILURE`;
  }

  get RESET() {
    return `${this.topic}__${this.name}__RESET`;
  }
}

export function generateAndSubmitForm(url, params = {}) {
  const form = global.document.createElement('form');
  form.method = 'POST';
  form.action = url;

  Object.keys(params).forEach((key) => {
    const hiddenField = global.document.createElement('input');
    hiddenField.type = 'hidden';
    hiddenField.name = key;
    hiddenField.value = params[key];

    form.appendChild(hiddenField);
  });

  global.document.body.appendChild(form);
  form.submit();
}

export function isWaffleFlagEnabled(flagName, defaultValue = false) {
  const value = getConfig().WAFFLE_FLAGS[flagName];
  return typeof value !== 'undefined' ? value : defaultValue;
}

/**
 * @param {string} productType will be one of
 * "Enrollment Code" | "Course Entitlement" | "Seat"
 * @returns ORDER_TYPES[TYPE]
 */
export function getOrderType(productType) {
  switch (productType) {
    case 'Enrollment Code':
      return ORDER_TYPES.BULK_ENROLLMENT;
    case 'Course Entitlement':
      return ORDER_TYPES.ENTITLEMENT;
    case 'Seat':
    default:
      return ORDER_TYPES.SEAT;
  }
}

/**
 * transformResults convert the basket data snake_case keys to camelCase
 * and then updates the target object `orderType` to the productType of
 * last product in the data.products array
 * @param {object} data {key:value} object to transform
 * @returns transformed results
 */
export function transformResults(data) {
  const results = camelCaseObject(data);

  const lastProduct = results.products && results.products[results.products.length - 1];
  results.orderType = getOrderType(lastProduct && lastProduct.productType);

  return results;
}

export function getReduxFormValidationErrors(error) {
  // error.fieldErrors is an array, and the fieldName key in it is snake case.
  // We need to convert this into an object with snakeCase keys and values that are the
  // userMessages.
  let fieldErrors = {};
  // Turn the error objects into key-value pairs on our new fieldErrors object.
  error.fieldErrors.forEach((fieldError) => {
    fieldErrors[fieldError.fieldName] = fieldError.userMessage;
  });

  // Modify the key names to be what the UI needs and then camelCase the whole thing.
  fieldErrors = camelCaseObject(convertKeyNames(fieldErrors, {
    address_line1: 'address',
    address_line2: 'unit',
  }));
  return fieldErrors;
}

export const localizedCurrencySelector = () => {
  const cookie = new Cookies().get(getConfig().CURRENCY_COOKIE_NAME);
  let currencyCode;
  let conversionRate;

  if (cookie && typeof cookie.code === 'string' && typeof cookie.rate === 'number') {
    currencyCode = cookie.code;
    conversionRate = cookie.rate;
  }

  const showAsLocalizedCurrency = typeof currencyCode === 'string' ? currencyCode !== 'USD' : false;

  return {
    currencyCode,
    conversionRate,
    showAsLocalizedCurrency,
  };
};

/**
 * hideFractionZeros
 * this function will hide fractional zeros if shouldHide is true
 * and price fractional value is zeros
 */
export const hideFractionZerosProps = ({ price, shouldHide }) => {
  let fractionDigitsProps = {};
  if (shouldHide) {
    const fractionValue = price.toString().split('.')[1];
    if (!fractionValue || parseInt(fractionValue, 10) === 0) {
      // don't show 0's if fraction is 0
      fractionDigitsProps = {
        maximumFractionDigits: 0,
      };
    }
  }
  return fractionDigitsProps;
};
