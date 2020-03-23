#!/bin/bash
# This script is used to minify the separated html, css and js files
# They are separated as the available npm packages don't work with combined html/css/js
# Once the files are minified, this script calls the python script that generates the static pages
rm -rf dist/ 
mkdir dist
rm -rf pages/
mkdir pages
echo "dist folder reset"
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
python3 generate_static_pages.py
echo "Pages generated!"