import { getQueryParameters } from '@edx/frontend-platform';
import { createSelector } from 'reselect';
import { localizedCurrencySelector } from '../../../payment/data/utils';
import { storeName } from '../constants';

export const subscriptionDetailsSelector = state => state[storeName].details;

export const detailsSelector = createSelector(
  subscriptionDetailsSelector,
  localizedCurrencySelector,
  (details, currency) => ({
    ...details,
    isCurrencyConverted: currency.showAsLocalizedCurrency,
  }),
);

export const currencyDisclaimerSelector = state => ({
  actualAmount: state[storeName].details.orderTotal,
});

export const queryParamsSelector = () => getQueryParameters(global.location.search);

export const subscriptionSelector = createSelector(
  subscriptionDetailsSelector,
  queryParamsSelector,
  (details) => ({
    ...details,
    isEmpty:
        details.loaded && !details.redirect && (!details.products || details.products.length === 0),
    isRedirect:
        (details.loaded && !!details.redirect) || !details.loaded,
  }),
);

export function submitErrorsSelector(formName) {
  return (state => (state.form && state.form[formName] ? state.form[formName].submitErrors : {}));
}

export const updateSubmitErrorsSelector = formName => createSelector(
  submitErrorsSelector(formName),
  submitErrors => ({ submitErrors }),
);
