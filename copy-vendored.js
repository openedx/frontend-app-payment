const fs = require('fs');
const path = require('path');

const outputDirectory = path.resolve(__dirname, 'dist');

fs.copyFileSync('flex-microform.js', path.resolve(outputDirectory, 'flex-microform.js'));
