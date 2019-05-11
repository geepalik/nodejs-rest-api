const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');

//import model
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    Post.find()
    .then(posts => {
        res.status(200).json({message: 'Fetch posts ok', posts: posts});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
    //test with dummy data
    /*
    res.status(200).json({
        posts:[
            {
                _id: 1,
                title: 'First post', 
                content: 'This is the first post', 
                imageUrl:'images/gum.jpg',
                creator: {
                    name: 'Maximilian'
                },
                createdAt: new Date()
            }
        ]
    });
    */
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data incorrect');
        error.statusCode = 422;
        throw error;
        //return manual function
        /*
        return res
        .status(422)
        .json({
            message: 'Validation failed, entered data incorrect',
            errors: errors.array()
        });
        */
    }
    
    if(!req.file){
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }
    //unix
    //const imageUrl = req.file.path;
    //windows
    const imageUrl = req.file.path.replace("\\","/");

    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title, 
        content: content,
        imageUrl: imageUrl,
        creator: {name: 'Gil'}
    });
    //create post in db
    post
    .save()
    .then(result => {
        console.log('saving ok: '+result)
        res.status(201).json({
            message: 'OK!',
            post: result
            //return object if not using mongoose
            /*
            {
                _id: new Date().toISOString(), 
                createdAt: new Date()
            }
            */
        });
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        //throw error
        //we are in promise chain
        //and not async, the above will not work
        next(err);
    });
};

exports.notFound = (req, res, next) => {
    res.status(400).json({
        status: 'Error!',
        message: 'Action not recognized'
    });
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('Could not find post');
            error.statusCode = 404;
            //error here will be passed as error in catch()
            throw error;
        }
        res.status(200).json({message: 'Post fetched', post: post});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data incorrect');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    //in case the image url is part of the incoming request
    //and its some text in the request body
    //case when image already exist and we dont update it
    let imageUrl = req.body.image;
    if(req.file){
        //in case a new image was uploaded from the edit form
        imageUrl = req.file.path;
    }
    if(!imageUrl){
        const error = new Error('No file picked');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }
        if(imageUrl !== post.imageUrl){
            clearImage(post.imageUrl);
        }
        imageUrl = imageUrl.replace("\\","/");
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
        return post.save();
    })
    .then(result => {
        //get result of save operation
        res.status(200).json({message: 'Post updated!', post: result});
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        //continue to next middleware
        next(err);
    });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }
        //TODO check logged in user 
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    })
    .then(result => {
        console.log(result);
        res.status(200).json({message: 'Post deleted'});
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
};

/**
 * delete previous image
 * function accepts filepath as argument
 */
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log('Error in deleting image: '+err+ ' of path '+filePath));
};