const fs = require('fs');
const path = require('path');

// Write our apple pay merchant thing
const fileName = 'apple-developer-merchantid-domain-association.txt';
const outputDirectory = path.resolve(__dirname, 'dist', '.well-known');

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
