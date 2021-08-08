/*
    pulling in the required packages
*/


const express = require('express')
const app = express();
const multer = require('multer')
const sharp = require('sharp')


/* 
    Setting up
*/


const port = 3000
const maxSize= 5000000 //5MB
const storage = multer.memoryStorage()

/*
    This is the multer middleware for express. We can specify controlling parameters here 
    such as applying the file size limit and specifying the allowed file types.
    The "single" property at the end determins if a single file is allowed to be processed,
    this file is stored in req.file.
    Note: If you intend to use a form on the frontend then pleas ensure the value passed in 
    as a param to the single method should be the exact same as the name attribute of 
    the HTML form.
*/
const upload = multer({ 
    storage: storage,
    limits: {fileSize: maxSize},
    fileFilter: (req, file, cb)=>{
        let regex = new RegExp( '([a-zA-Z0-9\s_\\.\-:])+(.jpeg|.jpg|.png)$')
        if(regex.test(file.originalname.toLowerCase()))
            return cb(null,true)
        else
        cb('error: please provide images only to this service', false)
    }
}).single('image')

/*
    POST route that resizes the supplied image base on the given width and height
*/

app.post('/upload', upload, async (req, res, next) => {
    
    let width, height = 25
    try
    {
        if(req.body.width !== undefined)
            width = parseInt(req.body.width)
        if(req.body.height !== undefined)
            height = parseInt(req.body.height)

        if(req.file !== undefined){
            const buffer = await sharp(req.file.buffer).resize({ width: width, height: height}).jpeg().toBuffer()
            res.setHeader('content-type', 'image/jpeg')
            res.send(buffer)
        }
        else{
            res.send('No file selected')
        }
    }
    catch(error){
        next(error)
    }

  })


/*
  Starting the server
*/
app.listen(port, () => console.log(`App listening to port ${port}`));