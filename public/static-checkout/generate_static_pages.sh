#!/bin/bash
# This script is used to minify the separated html, css and js files
# They are separated as the available npm packages don't work with combined html/css/js
# Once the files are minified, this script calls the python script that generates the static pages
# You may need to install the minification utilities globally, like this:
#   npm install -g html-minifier cssnano-cli uglify-js
rm -rf dist/ 
mkdir dist
rm -rf pages/
mkdir pages
echo "dist folder reset"
ASSETS="assets"
cp -R "$ASSETS" dist/
echo "$ASSETS copied to dist"
HTML_FILE_NAME="unminified.html"
CSS_FILE_NAME="unminified.css"
JS_FILE_NAME="unminified.js"
html-minifier --collapse-whitespace $HTML_FILE_NAME -o dist/minified.html
echo "$HTML_FILE_NAME minified"
cssnano $CSS_FILE_NAME dist/minified.css
echo "$CSS_FILE_NAME minified"
uglifyjs --compress --mangle -o dist/minified.js -- $JS_FILE_NAME
echo "$JS_FILE_NAME minified"
echo "Minification complete!"

# Un-comment the following to generate non-minified pages:
# cp $HTML_FILE_NAME dist/minified.html ; echo "ANTI-MIN $HTML_FILE_NAME"
# cp $CSS_FILE_NAME dist/minified.css ; echo "ANTI-MIN $CSS_FILE_NAME"
# cp $JS_FILE_NAME dist/minified.js ; echo "ANTI-MIN $JS_FILE_NAME"

python3 generate_static_pages.py
echo "Pages generated!"
