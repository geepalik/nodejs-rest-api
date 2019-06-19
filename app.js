const path = require('path');
const express = require('express');
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');
const app = express();
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const multer = require('multer');
const uuidv4 = require('uuid/v4');

const fileStorage = multer.diskStorage({
    //request object
    //information on the file
    //callback for destination
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        //filename
        //for unix based systems
        //cb(null, new Date().toISOString() + '-'+ file.originalname);
        //windows
        let extension = file.originalname.split('.').pop();
        cb(null, uuidv4()+'.'+extension);
    }
});

/**
 * filter to check file MIME type
 */
const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ){
        cb(null, true);
    }else{
        cb(null, false);
    }
}

//x-www-form-urlencoded <form>
//app.request(bodyParser.urlencoded());

//application/json
app.use(bodyParser.json());
//extract single file stored in some field 'image' in incoming request
app.use(
    multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
);
//serve images folder as static
//to be used anywhere in code regarding of os
app.use('/images',express.static(path.join(__dirname,'images')));


app.use((req, res, next) => {
    //allow access from every, elminate CORS
    res.setHeader('Access-Control-Allow-Origin','*');
    //set the allowed HTTP methods to be requested
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE');
    //headers clients can use in their requests
    res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
    //allow request to continue and be handled by routes
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);
//middleware to handle error in validation from controller
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});
})

mongoose.connect(
    'mongodb+srv://testuser:testusermongo@cluster0-dhgvo.mongodb.net/messages?retryWrites=true',
    { useNewUrlParser: true }
    )
    .then(result => {
        console.log('mongodb connection ok');
        app.listen(8080);
    })
    .catch(err => console.log('mongodb connection error: '+err));
;

//any other route that does not match our api
app.use(function(req, res, next){
    return res.status(404).send({
        message: 'Route '+req.url+' not found'
    })
});