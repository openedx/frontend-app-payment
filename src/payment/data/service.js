import pick from 'lodash.pick';

import { configureApiService as configureCouponApiService } from '../coupon';
import { applyConfiguration, handleRequestError } from '../../common/serviceUtils';

let config = {
  ACCOUNTS_API_BASE_URL: null,
  ECOMMERCE_BASE_URL: null,
  ECOMMERCE_API_BASE_URL: null,
  ECOMMERCE_RECEIPT_BASE_URL: null,
  LMS_BASE_URL: null,
};

let apiClient = null; // eslint-disable-line no-unused-vars

export function configureApiService(newConfig, newApiClient) {
  applyConfiguration(config, newConfig);
  config = pick(newConfig, Object.keys(config));
  apiClient = newApiClient;

  configureCouponApiService(config, apiClient);
}

export async function getBasket() {
  const { data } = await apiClient
    .get(`${config.ECOMMERCE_BASE_URL}/bff/payment/v0/payment/`)
    .catch(handleRequestError);

  const transformedResults = {
    showVoucherForm: data.show_voucher_form,
    paymentProviders: data.payment_providers,
    orderTotal: Number.parseInt(data.order_total, 10),
    calculatedDiscount: Number.parseInt(data.calculated_discount, 10),
    totalExclDiscount: Number.parseInt(data.total_excl_discount, 10),
    products: data.products.map(({ image_url: imageURL, title, seat_type: seatType }) => ({
      imageURL, title, seatType,
    })),
    voucher: data.voucher,
  };

  return transformedResults;
}

export async function sdnCheck(firstName, lastName, city, country) {
  const { data } = await apiClient.post(
    `${config.ECOMMERCE_BASE_URL}/api/v2/sdn/search/`,
    {
      name: `${firstName} ${lastName}`,
      city,
      country,
    },
  );

  return data;
}
