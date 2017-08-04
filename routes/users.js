var aws = require('aws-sdk');
var express = require('express');
const multer = require('multer');
var router = express.Router();
var multerS3 = require('multer-s3');
var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;

// Handle File uploads
const mongo = require('mongodb');
var db = require('monk')( process.env.MONGODB_URI || 'mongodb://localhost/nodeblog');
const users = db.get('users');

var albumBucketName = 'bloggerin';
var bucketRegion = 'us-east-1';

// aws.config.loadFromPath('./aws-config.json');


aws.config.region = 'us-east-1'; // Region
aws.config.credentials = new aws.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:c01d6ca1-d006-4999-b746-d4e014099cda',
});

var s3 = new aws.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});


var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'bloggerin',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.originalname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})




router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register', errors: '' });
});

router.post('/register', upload.single('avatar__image--upload'), function( req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  if (req.file) {
    console.log('Uploading File', req.file);
    var avatar = req.file.originalname;
  } else {
    console.log('No file uploaded');
    var avatar = 'default-avatar.png';
  }
  var newUser = {
    username: username,
    email: email,
    name: name,
    password: password,
    avatar: avatar
  };
  users.insert(newUser);
  res.render('register', { title: 'Register' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/logout', function(req, res, next) {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
