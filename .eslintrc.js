/* eslint import/no-extraneous-dependencies: ["error", {"peerDependencies": false}] */
const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('eslint', {
  rules: {
    'jsx-a11y/label-has-associated-control': ['error', {
      labelComponents: [],
      labelAttributes: [],
      controlComponents: [],
      assert: 'htmlFor',
      depth: 25,
    }],
  },
});
