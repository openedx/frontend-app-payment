const path = require('path');
const merge = require('webpack-merge');
const { getBaseConfig } = require('@edx/frontend-build');
const glob = require('glob');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NewRelicSourceMapPlugin = require('new-relic-source-map-webpack-plugin');

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

// We webpack-merge docs for reference on this usage
// https://www.npmjs.com/package/webpack-merge#mergeuniquefield-fields-field--field
const mergeUniquePlugins = merge.unique(
  'plugins',
  ['HtmlWebpackPlugin'],
  plugin => plugin.constructor && plugin.constructor.name,
);

// Filter plugins in the preset config that we don't want
function filterPlugins(plugins) {
  const pluginsToRemove = [
    'a', // "a" is the constructor name of HtmlWebpackNewRelicPlugin
  ];
  return plugins.filter(plugin => {
    const pluginName = plugin.constructor && plugin.constructor.name;
    return !pluginsToRemove.includes(pluginName);
  });
}

const config = merge({
  customizeArray(a, b, key) {
    if (key === 'plugins') {
      const uniquePlugins = mergeUniquePlugins(a, b, key);
      return filterPlugins(uniquePlugins);
    }

    // Fall back to default merging
    return undefined;
  },
})(
  {
    plugins: [
      // Generates an HTML file in the output directory.
      new HtmlWebpackPlugin({
        inject: false, // Manually inject head and body tags in the template itself.
        template: path.resolve(__dirname, 'public/index.html'),
        FAVICON_URL: process.env.FAVICON_URL || null,
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
      new NewRelicSourceMapPlugin({
        applicationId: process.env.NEW_RELIC_APP_ID,
        nrAdminKey: process.env.NEW_RELIC_ADMIN_KEY,
        staticAssetUrl: process.env.BASE_URL,
        // upload source maps in prod builds only
        noop: typeof process.env.NEW_RELIC_ADMIN_KEY === 'undefined',
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
        whitelistPatterns: [/-enter/, /-appear/, /-exit/, /flex-microform/],
      }),
    ],
  },
  getBaseConfig('webpack-prod'),
);

module.exports = config;
