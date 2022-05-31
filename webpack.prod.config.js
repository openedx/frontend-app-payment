const path = require('path');
const { mergeWithCustomize, unique } = require('webpack-merge');
const { getBaseConfig } = require('@edx/frontend-build');
// NOTE: This version of html-webpack-plugin must be the same major version as the one in
// frontend-build to avoid potential issues.
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * This plugin configuration overrides the default in webpack-prod for the following reasons:
 *
 * We need to have a custom html-webpack-plugin configuration to allow us to preconnect to
 * various domains.  See the public/index.html file for the companion usage of this configuration.
 */

const config = mergeWithCustomize({
  customizeArray: unique(
    'plugins',
    ['HtmlWebpackPlugin'],
    plugin => plugin.constructor && plugin.constructor.name,
  ),
})(
  getBaseConfig('webpack-prod'),
  {
    plugins: [
      // Generates an HTML file in the output directory.
      new HtmlWebpackPlugin({
        inject: false, // Manually inject head and body tags in the template itself.
        template: path.resolve(__dirname, 'public/index.html'),
        FAVICON_URL: process.env.FAVICON_URL || null,
        OPTIMIZELY_PROJECT_ID: process.env.OPTIMIZELY_PROJECT_ID || null,
        preconnect: (() => {
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

          return preconnectDomains;
        })(),
      }),
    ],
  },
);

module.exports = config;
