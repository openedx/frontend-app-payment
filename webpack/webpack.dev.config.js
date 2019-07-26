// This is the dev Webpack config. All settings here should prefer a fast build
// time at the expense of creating larger, unoptimized bundles.

const Merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PostCssRtlPlugin = require('postcss-rtl');

const commonConfig = require('./webpack.common.config.js');

module.exports = Merge.smart(commonConfig, {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    // enable react's custom hot dev client so we get errors reported in the browser
    hot: require.resolve('react-dev-utils/webpackHotDevClient'),
    app: path.resolve(__dirname, '../src/index.jsx'),
  },
  module: {
    // Specify file-by-file rules to Webpack. Some file-types need a particular kind of loader.
    rules: [
      // The babel-loader transforms newer ES2015+ syntax to older ES5 for older browsers.
      // Babel is configured with the .babelrc file at the root of the project.
      {
        test: /\.(js|jsx)$/,
        include: [
          path.resolve(__dirname, '../src'),
        ],
        loader: 'babel-loader',
        options: {
          // Caches result of loader to the filesystem. Future builds will attempt to read from the
          // cache to avoid needing to run the expensive recompilation process on each run.
          cacheDirectory: true,
        },
      },
      // We are not extracting CSS from the javascript bundles in development because extracting
      // prevents hot-reloading from working, it increases build time, and we don't care about
      // flash-of-unstyled-content issues in development.
      {
        test: /(.scss|.css)$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          {
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [PostCssRtlPlugin()],
            },
          },
          {
            loader: 'sass-loader', // compiles Sass to CSS
            options: {
              sourceMap: true,
              includePaths: [
                path.join(__dirname, '../node_modules'),
                path.join(__dirname, '../src'),
              ],
            },
          },
        ],
      },
    ],
  },
  // Specify additional processing or side-effects done on the Webpack output bundles as a whole.
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      BASE_URL: 'localhost:1998',
      LMS_BASE_URL: 'http://localhost:18000',
      CREDENTIALS_BASE_URL: 'http://localhost:18150',
      ECOMMERCE_BASE_URL: 'http://localhost:18130',
      LOGIN_URL: 'http://localhost:18000/login',
      LOGOUT_URL: 'http://localhost:18000/logout',
      CSRF_TOKEN_API_PATH: '/csrf/api/v1/token',
      REFRESH_ACCESS_TOKEN_ENDPOINT: 'http://localhost:18000/login_refresh',
      SEGMENT_KEY: null,
      ACCESS_TOKEN_COOKIE_NAME: 'edx-jwt-cookie-header-payload',
      USER_INFO_COOKIE_NAME: 'edx-user-info',
      CSRF_COOKIE_NAME: 'csrftoken',
      LANGUAGE_PREFERENCE_COOKIE_NAME: 'openedx-language-preference',
      CURRENCY_COOKIE_NAME: 'edx-price-l10n',
      SITE_NAME: 'edX',
      MARKETING_SITE_BASE_URL: 'http://localhost:18000',
      ENTERPRISE_MARKETING_URL: 'http://example.com',
      ENTERPRISE_MARKETING_UTM_CAMPAIGN: 'test_campaign',
      ENTERPRISE_MARKETING_UTM_SOURCE: 'orders',
      ENTERPRISE_MARKETING_FOOTER_UTM_MEDIUM: 'Footer',
      SUPPORT_URL: 'http://localhost:18000/support',
      CONTACT_URL: 'http://localhost:18000/contact',
      OPEN_SOURCE_URL: 'http://localhost:18000/openedx',
      TERMS_OF_SERVICE_URL: 'http://localhost:18000/terms-of-service',
      PRIVACY_POLICY_URL: 'http://localhost:18000/privacy-policy',
      FACEBOOK_URL: 'https://www.facebook.com',
      TWITTER_URL: 'https://twitter.com',
      YOU_TUBE_URL: 'https://www.youtube.com',
      LINKED_IN_URL: 'https://www.linkedin.com',
      REDDIT_URL: 'https://www.reddit.com',
      APPLE_APP_STORE_URL: 'https://www.apple.com/ios/app-store/',
      GOOGLE_PLAY_URL: 'https://play.google.com/store',
      ORDER_HISTORY_URL: 'localhost:1996/orders',
      CYBERSOURCE_URL: 'https://localhost/cybersource',
      APPLE_PAY_MERCHANT_IDENTIFIER: 'merchant.org.edx.stage.ecommerce',
      APPLE_PAY_MERCHANT_NAME: 'edX E-Commerce',
      APPLE_PAY_COUNTRY_CODE: 'US',
      APPLE_PAY_CURRENCY_CODE: 'USD',
      APPLE_PAY_START_SESSION_URL: 'http://localhost:18130/payment/cybersource/apple-pay/start-session/',
      APPLE_PAY_AUTHORIZE_URL: 'http://localhost:18130/payment/cybersource/apple-pay/authorize/',
      APPLE_PAY_SUPPORTED_NETWORKS: 'amex,discover,visa,masterCard',
      APPLE_PAY_MERCHANT_CAPABILITIES: 'supports3DS,supportsCredit,supportsDebit',
    }),
    // Generates an HTML file in the output directory.
    new HtmlWebpackPlugin({
      inject: true, // Appends script tags linking to the webpack bundles at the end of the body
      template: path.resolve(__dirname, '../public/index.html'),
      optimizelyId: process.env.OPTIMIZELY_PROJECT_ID,
    }),
    // when the --hot option is not passed in as part of the command
    // the HotModuleReplacementPlugin has to be specified in the Webpack configuration
    // https://webpack.js.org/configuration/dev-server/#devserver-hot
    new webpack.HotModuleReplacementPlugin(),
  ],
  // This configures webpack-dev-server which serves bundles from memory and provides live
  // reloading.
  devServer: {
    host: '0.0.0.0',
    port: 1998,
    historyApiFallback: true,
    hot: true,
    inline: true,
    publicPath: '/',
  },
});
