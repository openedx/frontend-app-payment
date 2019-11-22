import { createSelector, createStructuredSelector } from 'reselect';

import { getModuleState } from '../../../data/utils';
import {
  SEAT_MESSAGE_KEY,
  CREDIT_SEAT_MESSAGE_KEY,
  VERIFIED_SEAT_MESSAGE_KEY,
  SEAT_PRODUCT_TYPE,
  VERIFIED_CERTIFICATE_TYPE,
  CREDIT_CERTIFICATE_TYPE,
  ENROLLMENT_CODE_PRODUCT_TYPE,
  COURSE_ENTITLEMENT_PRODUCT_TYPE,
  ENTITLEMENT_MESSAGE_KEY,
  ENROLLMENT_CODE_MESSAGE_KEY,
} from './constants';

export const storePath = ['payment', 'basket'];

const paymentSelector = (state, props) =>
  getModuleState(state, props.storePath ? props.storePath : storePath);

const lastProductSelector = createSelector(
  paymentSelector,
  ({ products }) => products[products.length - 1],
);

const messageTypeSelector = createSelector(
  lastProductSelector,
  (lastProduct) => {
    if (lastProduct === undefined) {
      return null;
    }
    const { productType, certificateType } = lastProduct;
    if (productType === COURSE_ENTITLEMENT_PRODUCT_TYPE) {
      return ENTITLEMENT_MESSAGE_KEY;
    }
    if (productType === ENROLLMENT_CODE_PRODUCT_TYPE) {
      return ENROLLMENT_CODE_MESSAGE_KEY;
    }
    if (productType === SEAT_PRODUCT_TYPE) {
      if (certificateType === VERIFIED_CERTIFICATE_TYPE) {
        return VERIFIED_SEAT_MESSAGE_KEY;
      }
      if (certificateType === CREDIT_CERTIFICATE_TYPE) {
        return CREDIT_SEAT_MESSAGE_KEY;
      }
      return SEAT_MESSAGE_KEY;
    }
    return null;
  },
);

export const orderDetailsMapStateToProps = createStructuredSelector({
  messageType: messageTypeSelector,
});
