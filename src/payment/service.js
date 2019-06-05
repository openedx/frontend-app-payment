import pick from 'lodash.pick';

let config = {
  ACCOUNTS_API_BASE_URL: null,
  ECOMMERCE_API_BASE_URL: null,
  ECOMMERCE_RECEIPT_BASE_URL: null,
  LMS_BASE_URL: null,
};

let apiClient = null;

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
  return {};

  // eslint-disable-next-line no-unreachable
  const { data } = await apiClient.get(`${config.ECOMMERCE_API_BASE_URL}/baskets/wip-api`);
  const transformedResults = {
    total: data.order_total.excl_tax,
  };
  return {
    basket: transformedResults,
  };
}
