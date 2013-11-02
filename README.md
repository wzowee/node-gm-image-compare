node-gm-image-compare
=====================

An express based node app for testing the output of various settings when using the node gm module
and GraphicsMagick

gm - https://npmjs.org/package/gm
GraphicsMagick - http://www.graphicsmagick.org/

##Features

Test ouput when configuring
- Width
- Height
- Colorspace
- Quality
- Contrast
- Filter
- Sharpen

##Usage

Ensure you have node and GraphicsMagick installed

Run: node app.js

Browse to http://localhost:3000

Choose an image to convert, and select your options, then select submit.
The original and Resized image will be displayed, if width/height were selected then the original will have it's dimensions set to these to better enable comparison.

Converted files will be stored in public/images/compare
