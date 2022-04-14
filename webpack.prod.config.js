const { getBaseConfig } = require('@edx/frontend-build');
// NOTE: This version of html-webpack-plugin must be the same major version as the one in
// frontend-build to avoid potential issues.

/**
 * This plugin configuration edits the default in webpack-prod for the following reasons:
 *
 * We need to have a custom html-webpack-plugin configuration to allow us to preconnect to
 * various domains.  See the public/index.html file for the companion usage of this configuration.
 */

const config = getBaseConfig('webpack-prod');

/* eslint-disable no-param-reassign */
config.plugins.forEach((plugin) => {
  if (plugin.constructor.name === 'HtmlWebpackPlugin') {
    const preconnectDomains = [
      'https://api.segment.io',
      'https://cdn.segment.com',
      'https://www.google-analytics.com',
    ];

    if (process.env.LMS_BASE_URL) {
      preconnectDomains.push(process.env.LMS_BASE_URL);
    }

    if (process.env.OPTIMIZELY_PROJECT_ID) {
      preconnectDomains.push('https://logx.optimizely.com');
    }

    plugin.userOptions.preconnect = preconnectDomains;
  }
});

module.exports = config;
