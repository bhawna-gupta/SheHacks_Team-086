const express = require("express");
const bodyParser = require("body-parser");
const cricData= require('cric-player-info');
const prettier = require('prettier')
var extract = require('pdf-text-extract')
const {spawn} = require('child_process');
var sanitize = require("sanitize-filename");
const $ = require('jquery')
var isJson = require('is-json')
const prependhttp = require('prepend-http')
const prettyFormat = require('pretty-format'); 
var moment = require('moment')
var suggest = require('suggestion')
var whoisinfo = require('whois-json')
var timeout = require('connect-timeout'); 
var isValidDomain = require('is-valid-domain');
const pdfMerge = require('easy-pdf-merge');
const gtts = require('gtts')
const admzip = require('adm-zip')
const sharp = require('sharp')
const webp=require('webp-converter');
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
var format;
var outputFilePath;
const multer = require("multer");
const app = express();
app.use(timeout('800s'));
app.use(haltOnTimedout);

function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

app.use(express.static("public"));

var rimraf = require('rimraf')

var uploadsDir = __dirname + '/public/uploads';

fs.readdir(uploadsDir, function(err, files) {
  files.forEach(function(file, index) {
    fs.stat(path.join(uploadsDir, file), function(err, stat) {
      var endTime, now;
      if (err) {
        return console.error(err);
      }
      now = new Date().getTime();
      endTime = new Date(stat.ctime).getTime() + 3600000;
      if (now > endTime) {
        return rimraf(path.join(uploadsDir, file), function(err) {
          if (err) {
            return console.error(err);
          }
          console.log('successfully deleted');
        });
      }
    });
  });
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});



const imageFilter = function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if (
    ext !== ".png" &&
    ext !== ".jpg" &&
    ext !== ".jpeg" &&
    ext !== ".bmp" &&
    ext !== ".tiff" &&
    ext !== ".gif" &&
    ext !== ".wmf" &&
    ext !== ".pdf"
  ) {
    return callback("This Extension is not supported");
  }
  callback(null, true);
};


var maxSize = 200 * 1024 * 1024

var imageconverterupload = multer({
  storage: storage,
  fileFilter: imageFilter,
});

var imageconverter2 = multer({
  storage: storage,
  fileFilter: imageFilter,
}).single('file');
var dir = "public";
var subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);
}

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index",{title:"PDF ELIXIR"});
});

app.get('/txttopdf',(req,res) => {

  res.render('txttopdf',{title:'FREE TXT Text File to PDF File Converter Online Tool - Text to PDF Files Easy Converter Online Tool - FreeMediaTools.com'})
  
  })
  

app.get("/imageconverter", (req, res) => {
  res.render("imageconverter",{title:"PDF ELIXIR"});
});

app.get("/audioconverter", (req, res) => {
  res.render("audioconverter",{title:"PDF ELIXIR"});
});



app.get("/resizeimage", (req, res) => {
  res.render("resizeimage",{title:"Resize Image- PDF ELIXIR"});
});

// app.get("/imagetopdf", (req, res) => {
//   res.render("imagetopdf",{title:"Image to PDF -PDF ELIXIR"});
// });

// app.get("/encryptpdf", (req, res) => {
//   res.render("encryptpdf",{title:"Encrypt PDF with Password- PDF ELIXIR"});
// });


// app.get('/compressimage',(req,res) => {
//   res.render('compressimage',{title:"Compress Image- PDF ELIXIR"})
// })




app.get('/cropimage',(req,res) => {
  res.render('cropimage',{title:"Crop Image Online -PDF ELIXIR"})
})

app.get('/compressfiles',(req,res) => {
  res.render('compressfiles',{title:"Compress Files Online - PDF ELIXIR"})
})


app.get('/contactus',(req,res) => {
  res.render('contactus',{title:"Contact us Page - PDF ELIXIR"})
})



app.get('/texttospeech',(req,res) => {
  res.render('texttospeech',{title:"Free Text to Speech Online Converter - PDF ELIXIR"})
})


app.get('/mergepdf',(req,res) => {
  res.render('mergepdf',{title:"Concatenate or Merge Multiple PDF Files Online -PDF ELIXIR"})
})


app.get('/htmltopdf',(req,res)=>{

	res.render("htmltopdf",{title:"HTML to PDF - Convert your HTML Documents to PDF Online PDF ELIXIR"})

})




app.get('/download',(req,res) => {
  var pathoutput = req.query.path
  console.log(pathoutput)
  var fullpath = path.join(__dirname,pathoutput)
  res.download(fullpath,(err) =>{
      if(err){
          fs.unlinkSync(fullpath)
          res.send(err)
      }
      fs.unlinkSync(fullpath)
  })
})




app.post(
    "/imageconverter",
    (req, res) => {
        console.log(req.body.path);
  
        format = req.body.format;
  
        outputFilePath = Date.now() + "output." + format;
  
        exec(
          `ffmpeg -i ${req.body.path} -preset ultrafast ${outputFilePath}`,
          (err, stdout,stderr) => {
            if(err){
              res.json({
                  error:"some error takes place"
              })
          }
          res.json({
              path:outputFilePath
          })
    })
      
    })
  
    app.post('/uploadimageconverter',(req,res) =>{
      imageconverter2(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.json({
            path:req.file.path
        })
    });
    })
      


      
app.post(
          "/resizeimage",
          (req, res) => {
              console.log(req.body.path);
              var width = parseInt(req.body.width);
    var height = parseInt(req.body.height);
        
              outputFilePath = Date.now() + "output." + path.extname(req.body.path);
              console.log(outputFilePath)
        
              exec(
                `convert ${req.body.path} -resize ${width}x${height} ${outputFilePath}`,
                (err, stdout,stderr) => {
                  if(err){
                    res.json({
                        error:"some error takes place"
                    })
                }
                res.json({
                    path:outputFilePath
                })
          })
            
          })
          var resizeimageupload = multer({
            storage: storage,
            fileFilter: imageFilter,
          }).single('file');
        
          app.post('/uploadresizeimage',(req,res) =>{
            resizeimageupload(req,res,function(err) {
              if(err) {
                  return res.end("Error uploading file.");
              }
              res.json({
                  path:req.file.path
              })
          });
          })
        
  //  app.post(
  //           "/imagetopdf",
  //           (req, res) => {

  //               var list = req.body.list
               
          
  //               outputFilePath = Date.now() + "output.pdf";
  //               console.log(outputFilePath)
          
  //               exec(
  //                 `img2pdf ${list} -o ${outputFilePath}`,
  //                 (err, stdout,stderr) => {
  //                   if(err){
  //                     res.json({
  //                         error:"some error takes place"
  //                     })
  //                 }
  //                 res.json({
  //                     path:outputFilePath
  //                 })
  //           })
              
  //           })
  //           var imagetopdfupload = multer({
  //             storage: storage,
  //             fileFilter: imageFilter,
  //           }).array('file',100);
          
  //           app.post('/uploadimagetopdf',(req,res) =>{
  //             imagetopdfupload(req,res,function(err) {
  //               if(err) {
  //                   return res.end("Error uploading file.");
  //               }
  //               var list = "";
  //   req.files.forEach((file) => {
  //     list += `${file.path}`;
  //     list += " ";
  //   });
  //               res.json({
  //                   list:list
  //               })
  //           });
  //           })
const htmlfilter = function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if (ext !== ".html" && ext !== ".htm") {
    return callback("This Extension is not supported");
  }
  callback(null, true);
};


const imageFiltercompress = function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if (
    ext !== ".png" &&
    ext !== ".jpg" &&
    ext !== ".jpeg" &&
    ext !== ".bmp" &&
    ext !== ".tiff" &&
    ext !== ".gif" &&
    ext !== ".wmf"
  ) {
    return callback("This Extension is not supported");
  }
  callback(null, true);
};
// var compressimageupload = multer({storage:storage,fileFilter:imageFiltercompress})
// app.post("/compressimage", compressimageupload.single("file"), (req, res) => {
//   if (req.file) {
//     console.log(req.file.path);

//     var quality = req.body.quality


//     outputFilePath =
//       Date.now() + "output" + path.extname(req.file.originalname);

//     exec(
//       `convert ${req.file.path} -quality ${quality} ${outputFilePath}`,
//       (err, stderr, stdout) => {
//         if (err) {
//           fs.unlinkSync(req.file.path);
//           fs.unlinkSync(outputFilePath);
//           res.send("Some error occured during conversion Please try Again");
//         }
//         console.log("video converted");
//         res.download(outputFilePath, (err) => {
//           if (err) {
//             fs.unlinkSync(req.file.path);
//             fs.unlinkSync(outputFilePath);
//             res.send("Server is unable to download the file");
//           }

//           fs.unlinkSync(req.file.path);
//           fs.unlinkSync(outputFilePath);
//         });
//       }
//     );
//   }
// });



app.post("/mergeimages", imageconverterupload.array("file", 100), (req, res) => {
  if (req.files) {
    var list = "";
    req.files.forEach((file) => {
      list += `${file.path}`;
      list += " ";
    });

    var position = req.body.position

    console.log(list);

    outputFilePath = Date.now() + "output.png";

    exec(`convert ${list} ${position} ${outputFilePath}`, (err, stderr, stdout) => {
      if (err) {
        if (req.files) {
          req.files.forEach((file) => {
            fs.unlinkSync(file.path);
          });
        }
        res.send("Some error occured during conversion Please try Again");
      }
      console.log("image merged");
      res.download(outputFilePath, (err) => {
        if (err) {
          if (req.files) {
            req.files.forEach((file) => {
              fs.unlinkSync(file.path);
            });
          }
          fs.unlinkSync(outputFilePath);
          res.send("Server is unable to download the file");
        }

        if (req.files) {
          req.files.forEach((file) => {
            fs.unlinkSync(file.path);
          });
        }
        fs.unlinkSync(outputFilePath);
      });
    });
  }
});



app.post("/cropimage", imageconverterupload.single("file"), (req, res) => {
  if (req.file) {

    var width = parseInt(req.body.width)

    var height = parseInt(req.body.height)

    outputFilePath = Date.now() + "output.png";

    sharp(req.file.path).extract({ width: width, height: height, left: 0, top: 0 }).toFile(outputFilePath)
    .then(function(new_file_info) {
        console.log("Image cropped and saved");
        res.download(outputFilePath,(err) => {
          if(err){
            fs.unlinkSync(req.file.path)
            fs.unlinkSync(outputFilePath)
            res.send("Some error in cropping the image")
          }
          fs.unlinkSync(req.file.path)
          fs.unlinkSync(outputFilePath)
        })
    })
    .catch(function(err) {
       fs.unlinkSync(req.file.path)
       fs.unlinkSync(outputFilePath)
        console.log("An error occured");
    });

    
  }
});


var compressfilesupload = multer({ storage: storage,limits:{fileSize:maxSize}});

app.post("/compressfiles", compressfilesupload.array("file", 100), (req, res) => {
  var zip = new admzip();
var outputFilePath = Date.now() + "output.zip";
  if (req.files) {
    req.files.forEach((file) => {
      console.log(file.path)
      zip.addLocalFile(file.path)
    });
    fs.writeFileSync(outputFilePath, zip.toBuffer());
    res.download(outputFilePath,(err) => {
      if(err){
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        });
        fs.unlinkSync(outputFilePath) 
      }

      req.files.forEach((file) => {
        fs.unlinkSync(file.path)
      });

      fs.unlinkSync(outputFilePath)
    })
  }
});


app.post('/texttospeech',(req,res) => {

  var language = req.body.language

  var text = req.body.text

  console.log(language)

  console.log(text)

  var gttsVoice = new gtts(text,language)

  outputFilePath = Date.now() + "output.mp3"

  gttsVoice.save(outputFilePath,function(err,result){
    if(err){
      fs.unlinkSync(outputFilePath)
      res.send("An error takes place in generating the audio")
    }
    res.download(outputFilePath,(err) => {
      if(err){
        fs.unlinkSync(outputFilePath)
        res.send("An error occured in downloading the audio file")
      }
      fs.unlinkSync(outputFilePath)
    })
  })

})

const mergepdffilter = function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if (
    ext !== ".pdf"
  ) {
    return callback("This Extension is not supported");
  }
  callback(null, true);
};

var mergepdffilesupload = multer({storage:storage,fileFilter:mergepdffilter})


app.post('/mergepdf',mergepdffilesupload.array('file',100),(req,res) => {
    const files = []
    outputFilePath = Date.now() + "output.pdf"
    if(req.files){
      req.files.forEach(file => {
        console.log(file.path)
        files.push(file.path)
      });

      pdfMerge(files,outputFilePath,function(err){
	if(err){
	   res.send(err)
           
        }
          res.download(outputFilePath,(err) => {
          if(err){
            res.send(err)   
          }
          fs.unlinkSync(outputFilePath)
        })
      })
}
     
})

app.get('/pdftohtml',(req,res) => {

res.render('pdftohtml',{title:'FREE PDF to HTML Document Converter Online Tool - PDF Document to HTML Document Converter Online - FreeMediaTools.com'})

})
app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});


