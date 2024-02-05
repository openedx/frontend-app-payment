const { getBaseConfig } = require('@openedx/frontend-build');

/**
 * We customize the plugins here for the following reasons:
 *
 * - We want a custom html-webpack-plugin config
 */
const config = getBaseConfig('webpack-dev-stage');

config.devServer.proxy = {
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
};

module.exports = config;
