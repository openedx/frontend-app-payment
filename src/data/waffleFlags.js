import { getConfig } from '@edx/frontend-platform';

const isTruthy = /^\s*(true|t|1|on)\s*$/i;

/**
 * Waffle Flag Prefix
 * @type {string}
 * @link https://waffle.readthedocs.io/en/latest/testing/user.html#querystring-parameter
 */
export const WAFFLE_PREFIX = 'dwft_';

/**
 * Get Processed Waffle Flags from the current document location or from any other URL-like String
 * @param {string|URL} [urlString=document.location] The input URL String or any Stringifier
 * @returns {{}} Current Waffle Flags (Keyed by Flag Name, Value is a boolean whether it is enabled.)
 */
export function processUrlWaffleFlags(urlString) {
  const safeUrlString = !urlString ? document.location : urlString;

  return Array.from(new URL(safeUrlString).searchParams.entries())
    .reduce((dict, [key, value]) => {
      if (key.startsWith(WAFFLE_PREFIX)) {
        const configKey = key.substring(WAFFLE_PREFIX.length, key.length);
        dict[configKey] = isTruthy.test(value); // eslint-disable-line no-param-reassign
      }
      return dict;
    }, {});
}

/**
 * Intercept and set Waffle Flags from incoming API Calls
 * @param requestConfig
 * @returns {Promise<*>}
 */
export async function waffleInterceptor(requestConfig) {
  const params = requestConfig.params || {};
  const curWaffleFlags = getConfig().WAFFLE_FLAGS;
  Object.keys(curWaffleFlags).forEach((key) => {
    const fullKey = encodeURIComponent(WAFFLE_PREFIX + key);
    params[fullKey] = curWaffleFlags[key] ? '1' : '0';
  });
  requestConfig.params = params; // eslint-disable-line no-param-reassign
  return requestConfig;
}
