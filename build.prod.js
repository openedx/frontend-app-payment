const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies
const config = require('./webpack/webpack.prod.config.js');
const fs = require('fs');
const path = require('path');

webpack(config, (err, stats) => { // Stats Object
  if (err || stats.hasErrors()) {
    // Handle errors here
    process.exit(1);
  }

  // Write our apple pay merchant thing
  const fileName = 'apple-developer-merchantid-domain-association.txt';
  const outputDirectory = path.resolve(config.output.path, '.well-known');

  let fileContents;

  if (process.env.APPLE_DEVELOPER_MERCHANT_ID_DOMAIN_ASSOCIATION) {
    // Replace spaces with newlines for apple verification file because
    // build config values can't have newlines in them. We use spaces
    // to represent newlines instead.
    fileContents = process.env.APPLE_DEVELOPER_MERCHANT_ID_DOMAIN_ASSOCIATION.replace(/ /g, '\n');
  } else {
    fileContents = `
No domain association file was supplied. \n\n
For more information on setting up Apple Pay, see: \n
https://developer.apple.com/documentation/apple_pay_on_the_web/configuring_your_environment 
or \n
https://developer.apple.com/documentation/apple_pay_on_the_web/maintaining_your_environment
    `;
  }

  fs.mkdirSync(outputDirectory);
  fs.writeFileSync(path.resolve(outputDirectory, fileName), fileContents);

  // Done processing
  process.exit();
});
