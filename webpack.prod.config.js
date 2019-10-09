const { getBaseConfig } = require('@edx/frontend-build');
const glob = require('glob');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const NewRelicSourceMapPlugin = require('new-relic-source-map-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const path = require('path');

const config = getBaseConfig('webpack-prod');

/**
 * This plugin configuration overrides the default in webpack-prod for the following reasons:
 *
 * - It removes html-webpack-new-relic-plugin - we manually add our new relic script to the HTML
 *   in this repo.
 * - We need to have a custom html-webpack-plugin configuration to support the above, and to
 *   allow us to preconnect to various domains.  See the public/index.html file for the companion
 *   usage of this configuration
 * - We add purgecss-webpack-plugin.
 */
config.plugins = [
  // Cleans the dist directory before each build
  new CleanWebpackPlugin(),
  // Writes the extracted CSS from each entry to a file in the output directory.
  new MiniCssExtractPlugin({
    filename: '[name].[chunkhash].css',
  }),
  // Generates an HTML file in the output directory.
  new HtmlWebpackPlugin({
    inject: false, // Manually inject head and body tags in the template itself.
    template: path.resolve(__dirname, 'public/index.html'),
    optimizelyId: process.env.OPTIMIZELY_PROJECT_ID,
    newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY || 'fake_license',
    newRelicApplicationID: process.env.NEW_RELIC_APP_ID || 'fake_app',
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
  new Dotenv({
    path: path.resolve(__dirname, '.env'),
    systemvars: true,
  }),
  new NewRelicSourceMapPlugin({
    applicationId: process.env.NEW_RELIC_APP_ID,
    nrAdminKey: process.env.NEW_RELIC_ADMIN_KEY,
    staticAssetUrl: process.env.BASE_URL,
    // upload source maps in prod builds only
    noop: typeof process.env.NEW_RELIC_ADMIN_KEY === 'undefined',
  }),
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
  }),
  // Scan files for class names and ids and remove unused css
  new PurgecssPlugin({
    paths: [].concat(
      // Scan files in this app
      glob.sync('src/**/*', { nodir: true }),
      // Scan files in any edx frontend-component
      glob.sync('node_modules/@edx/frontend-component*/**/*', { nodir: true }),
      // Scan files in paragon
      glob.sync('node_modules/@edx/paragon/**/*', { nodir: true }),
    ),
    // Protect react-css-transition class names
    whitelistPatterns: [/-enter/, /-appear/, /-exit/],
  }),
];

module.exports = config;
