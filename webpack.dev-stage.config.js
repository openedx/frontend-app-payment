const path = require('path');
const { getBaseConfig } = require('@edx/frontend-build');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * We customize the plugins here for the following reasons:
 *
 * - We want a custom html-webpack-plugin config
 */
const config = merge({
  customizeArray: merge.unique(
    'plugins',
    ['HtmlWebpackPlugin'],
    plugin => plugin.constructor && plugin.constructor.name,
  ),
})(
  {
    plugins: [
      // Generates an HTML file in the output directory.
      new HtmlWebpackPlugin({
        inject: false, // Appends script tags linking to the webpack bundles at the end of the body
        template: path.resolve(__dirname, 'public/index.html'),
        optimizelyId: process.env.OPTIMIZELY_PROJECT_ID,
        newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY || 'fake_license',
        newRelicApplicationID: process.env.NEW_RELIC_APP_ID || 'fake_app',
      }),
    ],

    // This is a custom devServer configuration to allow this dev server to hit
    // staging for various URLs.
    devServer: {
      proxy: {
        '/proxy/ecommerce': {
          target: 'https://ecommerce.stage.edx.org',
          secure: false,
          pathRewrite: { '^/proxy/ecommerce': '' },
          changeOrigin: true,
        },
        '/proxy/lms': {
          target: 'https://courses.stage.edx.org',
          secure: false,
          pathRewrite: { '^/proxy/lms': '' },
          changeOrigin: true,
        },
        '/proxy/credentials': {
          target: 'https://credentials.stage.edx.org',
          secure: false,
          pathRewrite: { '^/proxy/credentials': '' },
          changeOrigin: true,
        },
      },
    },
  },
  getBaseConfig('webpack-dev-stage'),
);

module.exports = config;
