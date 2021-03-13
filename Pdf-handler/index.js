const express = require('express'),
    app = express();

var bodyParser = require('body-parser');
const uuid = require('uuid')
const cors = require('cors')

app.use(cors())
// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));

var multer = require('multer');
var upload = multer();

//form-urlencoded
app.use(express.static(__dirname + '/public'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})
app.get('/', (req, res) => {
    res.status(200).send({
        message: "All Ok"
    })
})

app.get('/download/:name', (req,res) => {
    res.download(__dirname+'/public/'+ req.params.name);
})

// Way to use multer for "file" field in formdata
app.post('/mergeFiles', upload.array('file'), async (req, res) => {
    console.log(req.body)
    // console.log(req.body.file[0])
    console.log(req.params)
    console.log(req.files)
    let bufferArray = [];

    if (req.files)
        for (var i = 0; i < req.files.length; i++)
            bufferArray.push(req.files[i].buffer)
    console.log(bufferArray)

    const { merge } = require('merge-pdf-buffers');
    const fs = require('fs')

    try{
        const merged = await merge(bufferArray);

        console.log(merged)
    
        let fileName = uuid.v4();
    
        fs.writeFileSync(`public/${fileName}.pdf`, merged)
    
        fs.watch(`public`, (eventType, filename) => { 
            console.log("\nThe file", filename, "was modified!"); 
            console.log("The type of change was:", eventType); 
        }); 

        res.status(200).send({
            message: `${fileName}.pdf`
        })
    

    }catch(e){
        res.status(500).send({
            message: `Error`
        })
    }

  
    

    // res.status(200).download(`public/${fileName}.pdf`)
})

app.listen(process.env.PORT || 8081, () => {
    console.log('Server Started at port 8081')
})



