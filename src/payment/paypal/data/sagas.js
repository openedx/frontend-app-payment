import { call, put, select, takeEvery } from 'redux-saga/effects';
import { logError } from '@edx/frontend-logging';

import {
  SUBMIT_PAYMENT_PAYPAL,
  submitPaymentPayPalBegin,
  submitPaymentPayPalFailure,
} from './actions';

import * as PayPalApiService from './service';

import { generateAndSubmitForm } from '../../../common/utils';
import { handleErrorFeedback } from '../../../feedback';
import { isUnknownError } from '../../../common/serviceUtils';

export function* handleSubmitPaymentPayPal() {
  yield put(submitPaymentPayPalBegin());
  try {
    const basket = yield select(state => ({ ...state.payment.basket }));
    const checkout = yield call(
      PayPalApiService.checkout,
      basket.basketId,
    );

    generateAndSubmitForm(checkout.payment_page_url);
  } catch (error) {
    yield put(submitPaymentPayPalFailure());
    yield call(handleErrorFeedback, error, true);
    if (isUnknownError(error)) {
      logError(error);
    }
  }
}

export default function* saga() {
  yield takeEvery(SUBMIT_PAYMENT_PAYPAL.BASE, handleSubmitPaymentPayPal);
}
