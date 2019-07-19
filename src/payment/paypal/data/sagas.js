import { call, put, select, takeEvery } from 'redux-saga/effects';
import {
  SUBMIT_PAYMENT_PAYPAL,
  submitPaymentPayPalBegin,
  submitPaymentPayPalFailure,
} from './actions';

import * as PayPalApiService from './service';

import { generateAndSubmitForm } from '../../../common/utils';
import { handleErrors } from '../../../feedback';

export function* handleSubmitPaymentPayPal() {
  yield put(submitPaymentPayPalBegin());
  try {
    const basket = yield select(state => ({ ...state.payment.basket }));
    const checkout = yield call(
      PayPalApiService.checkout,
      basket.basketId,
    );

    generateAndSubmitForm(checkout.payment_page_url);
  } catch (e) {
    yield put(submitPaymentPayPalFailure());
    yield call(handleErrors, e);
  }
}

export default function* saga() {
  yield takeEvery(SUBMIT_PAYMENT_PAYPAL.BASE, handleSubmitPaymentPayPal);
}
