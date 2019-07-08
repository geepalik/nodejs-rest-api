const express = require('express');
const { body } = require('express-validator/check');
const router = express.Router();
const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

//GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

//POST /feed/post
//use express validator for title and content fields
//we do image validation in the controller
router.post('/post', isAuth, [
    body('title')
    .trim()
    .isLength({min: 5}),
    body('content')
    .trim()
    .isLength({min: 5})
],
feedController.createPost);

//get single post
router.get('/post/:postId', isAuth, feedController.getPost);

//edit single post
router.put(
    '/post/:postId', isAuth, [
    body('title') 
        .trim()
        .isLength({min: 5}),
    body('content')
        .trim()
        .isLength({min: 5})
    ],
    feedController.updatePost
);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;