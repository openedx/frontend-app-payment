import pick from 'lodash.pick';

let config = {
  ACCOUNTS_API_BASE_URL: null,
  ECOMMERCE_API_BASE_URL: null,
  ECOMMERCE_RECEIPT_BASE_URL: null,
  LMS_BASE_URL: null,
};

let apiClient = null; // eslint-disable-line no-unused-vars

function validateConfiguration(newConfig) {
  Object.keys(config).forEach((key) => {
    if (newConfig[key] === undefined) {
      throw new Error(`Service configuration error: ${key} is required.`);
    }
  });
}

export function configureApiService(newConfig, newApiClient) {
  validateConfiguration(newConfig);
  config = pick(newConfig, Object.keys(config));
  apiClient = newApiClient;
}

export async function getBasket() {
  const data = require('./__mocks__/getBasket.json'); // eslint-disable-line
  // const { data } = await apiClient.get(`${config.ECOMMERCE_API_BASE_URL}/baskets/wip-api`);

  const transformedResults = {
    showVoucherForm: data.show_voucher_form,
    paymentProviders: data.payment_providers,
    orderTotal: data.order_total,
    calculatedDiscount: data.calculated_discount,
    sdnCheck: data.sdn_check,
    totalExclDiscount: data.total_excl_discount,
    products: data.products.map(({ img_url: imgUrl, name, seat_type: seatType }) => ({
      imgUrl, name, seatType,
    })),
    voucher: data.voucher,
  };

  return transformedResults;
}
