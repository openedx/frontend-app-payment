const { getBaseConfig } = require('@edx/frontend-build');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const config = getBaseConfig('webpack-dev');

/**
 * We customzie the plugins here for the following reasons:
 *
 * - We want a custom html-webpack-plugin config
 */
config.plugins = [
  // Generates an HTML file in the output directory.
  new HtmlWebpackPlugin({
    inject: false, // Appends script tags linking to the webpack bundles at the end of the body
    template: path.resolve(__dirname, 'public/index.html'),
    optimizelyId: process.env.OPTIMIZELY_PROJECT_ID,
    newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY || 'fake_license',
    newRelicApplicationID: process.env.NEW_RELIC_APP_ID || 'fake_app',
  }),
  new Dotenv({
    path: path.resolve(__dirname, '.env.development'),
    systemvars: true,
  }),
  // when the --hot option is not passed in as part of the command
  // the HotModuleReplacementPlugin has to be specified in the Webpack configuration
  // https://webpack.js.org/configuration/dev-server/#devserver-hot
  new webpack.HotModuleReplacementPlugin(),
];

module.exports = config;
