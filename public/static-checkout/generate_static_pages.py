import csv
# Combine minified html/css/js into one string
with open('dist/minified.html', 'r') as file:
    html = file.read().replace('\n', '')
with open('dist/minified.css', 'r') as file:
    css = file.read().replace('\n', '')
with open('dist/minified.js', 'r') as file:
    js = file.read().replace('\n', '')
# Insert css into the html
style_index = html.find('<style>') + 7
html = html[:style_index] + css + html[style_index:]
# Insert javascript into the html
script_index = html.find('<script>') + 8
html = html[:script_index] + css + html[script_index:]

# Read in course data and generate a page for each course
with open('courselist.csv', newline='') as csvfile:
    coursehtml = (html + '.')[:-1]
    csvreader = csv.reader(csvfile, delimiter=',')
    for row in csvreader:
        # Insert title price and image url into the page html
        title, image, sku, price = row
        coursehtml = coursehtml.replace('replacetitle', title)
        coursehtml = coursehtml.replace('replaceprice', '$' + price, 2)
        image_url = 'https://prod-discovery.edx-cdn.org/' + image
        coursehtml = coursehtml.replace('replaceimage', image_url)
        # Write the html for each course into a separate file
        with open('pages/' + sku + '.html', "w") as f:
            f.write(coursehtml) 




