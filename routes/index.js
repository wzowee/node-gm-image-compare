var fs = require("fs")
   ,gm = require("gm")
   ,async = require("async");

var _fileStore = __dirname + "/../public/images/compare/";
var colorspaceOptions = ["CineonLog","CMYK","GRAY","HSL","HWB","OHTA","RGB","Rec601Luma","Rec709Luma","Rec601YCbCr","Rec709YCbCr","Transparent","XYZ","YCbCr","YIQ","YPbPr","YUV"];
var filterOptions = ["Point","Box","Triangle","Hermite","Hanning","Hamming","Blackman","Gaussian","Quadratic","Cubic","Catrom","Mitchell","Lanczos","Bessel","Sinc"];

function GetViewModel(req, originalImage, resizedImage){

    var viewModel = {
        title: 'GraphicsMagick for node.js - Image Compare Tool',
        resize: {
            width: req.body.resizeWidth || null,
            height: req.body.resizeHeight || null,
            force: req.body.resizeForce ? "checked=\"checked\"" : ""
        },
        colorspace: req.body.colorspace,
        quality: req.body.quality,
        contrast: req.body.contrast,
        filter: req.body.filter,
        sharpen:{
          radius: req.body.sharpenRadius,
          sigma: req.body.sharpenSigma
        },
        originalImage: originalImage,
        resizedImage: resizedImage,
        options:{
            colorspace: colorspaceOptions,
            filter: filterOptions
        }
    }

    return viewModel;
}

exports.index = function(req, res){

  var processImage = function(imagePath){
      fs.readFile(imagePath, function (err, data) {
          if(err){
              console.error(err);
          }

          async.parallel([function(callback){
              var imageName = "original-" + req.files.image.name;
              var newPath = _fileStore +  imageName;
              fs.writeFile(newPath, data, function (err) {
                  if(err){
                      callback(err,null);
                  }
                  else{
                      fs.stat(newPath, function(err, stats){
                          callback(err,{imageName:imageName, size:stats.size});
                      });
                  }

              });
          },function(callback){
              var imageName = "resized-" + req.files.image.name;
              var newPath = _fileStore +  imageName;

              var image = gm(data);

              // Resize
              if(req.body.resizeWidth || req.body.resizeHeight){
                  var width = req.body.resizeWidth || null;
                  var height = req.body.resizeHeight || null;
                  var force = req.body.resizeForce;

                  if(force)
                      image.resize(width, height, "!");
                  else
                      image.resize(width, height);
              }

              // Colorspace
              if(req.body.colorspace){
                  image.colorspace(req.body.colorspace);
              }

              // Quality
              if(req.body.quality){
                  image.quality(req.body.quality);
              }

              // Contrast
              if(req.body.contrast){
                  image.contrast(req.body.contrast);
              }

              // Filter
              if(req.body.filter){
                  image.filter(req.body.filter);
              }

              // Sharpen
              if(req.body.sharpenRadius){
                  if(req.body.sharpenSigma){
                      image.sharpen(req.body.sharpenRadius, req.body.sharpenSigma);
                  }else{
                      console.info("sharpen by radius");
                      image.sharpen(req.body.sharpenRadius);
                  }
              }

              image.write(newPath, function(err){
                  if(err){
                      callback(err,null);
                  }
                  else{
                      fs.stat(newPath, function(err, stats){
                          callback(err,{imageName:imageName, size:stats.size});
                      });
                  }
              });
          }
          ], function(err, results){
              var viewModel = GetViewModel(req, results[0], results[1]);
              res.render('index', viewModel);
          });
      });
  }

  // Post Back
  if(req.files.image && req.files.image.size > 0){
      console.dir(req.files.image);
      console.info("Processing upload");
      processImage(req.files.image.path);
  }else if(req.body.originalImage){
      console.info("Reprocessing original");
      processImage(_fileStore + req.body.originalImage);
  }else{
      var viewModel = GetViewModel(req, "", "");
      res.render('index',viewModel);
  }
};