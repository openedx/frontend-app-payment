import { call, put, select, takeEvery } from 'redux-saga/effects';
import {
  SUBMIT_PAYMENT_CYBERSOURCE,
  submitPaymentCybersourceBegin,
  submitPaymentCybersourceFailure,
} from './actions';

import * as CybersourceApiService from './service';

import { generateAndSubmitForm } from '../../../common/utils';
import { handleErrors } from '../../../feedback';
import { configuration } from '../../../environment';

export function* handleSubmitPaymentCybersource(action) {
  const { cardHolderInfo, cardDetails } = action.payload;
  yield put(submitPaymentCybersourceBegin());
  try {
    const sdnCheck = yield call(
      CybersourceApiService.sdnCheck,
      cardHolderInfo.firstName,
      cardHolderInfo.lastName,
      cardHolderInfo.city,
      cardHolderInfo.country,
    );

    if (sdnCheck.hits > 0) {
      window.location.href = `${configuration.ECOMMERCE_BASE_URL}/payment/sdn/failure/`;
    }

    const basket = yield select(state => ({ ...state.payment.basket }));
    const checkout = yield call(
      CybersourceApiService.checkout,
      basket.basketId,
      cardHolderInfo,
    );

    const {
      cardNumber,
      cardTypeId,
      securityCode,
      cardExpirationMonth,
      cardExpirationYear,
    } = cardDetails;
    const cybersourcePaymentParams = {
      ...checkout.form_fields,
      card_number: cardNumber,
      card_type: cardTypeId,
      card_cvn: securityCode,
      card_expiry_date: [cardExpirationMonth.padStart(2, '0'), cardExpirationYear].join('-'),
    };
    generateAndSubmitForm(configuration.CYBERSOURCE_URL, cybersourcePaymentParams);
  } catch (e) {
    yield put(submitPaymentCybersourceFailure());
    yield call(handleErrors, e);
  }
}

export default function* saga() {
  yield takeEvery(SUBMIT_PAYMENT_CYBERSOURCE.BASE, handleSubmitPaymentCybersource);
}
