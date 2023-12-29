const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  coveragePathIgnorePatterns: [
    'src/setupTest.js',
    'src/index.jsx',
    'src/payment/checkout/card-validator',
    'src/payment/data/handleRequestError.js',
    'src/payment/performanceEventing.js',
    'src/i18n',
    'src/store',
    'src/data',
    'src/payment/EcommerceRedirect.jsx',
    'src/payment/PageLoading.jsx',
    'src/payment/checkout/payment-form/FormInput.jsx',
    'src/payment/checkout/payment-form/FormSelect.jsx',
  ],
});
