import postCouponJson from './__mocks__/postCoupon.json';
import deleteCouponJson from './__mocks__/deleteCoupon.json';

export async function postCoupon(code) { // eslint-disable-line no-unused-vars
  return { code: postCouponJson.voucher.code, voucherId: postCouponJson.voucher.id };
}

export async function deleteCoupon(voucherId) { // eslint-disable-line no-unused-vars
  return deleteCouponJson;
}
