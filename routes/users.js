var aws = require('aws-sdk');
var express = require('express');
const multer = require('multer');
var router = express.Router();
var multerS3 = require('multer-s3')

// Handle File uploads
const mongo = require('mongodb');
var db = require('monk')( process.env.MONGODB_URI || 'mongodb://localhost/nodeblog');

var albumBucketName = 'bloggerin';
var bucketRegion = 'us-east-1';
var IdentityPoolId = process.env.IDENTITY_POOL_ID;

aws.config.update({
  region: bucketRegion,
  credentials: new aws.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
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
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})




router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register', errors: '' });
});

router.post('/register',upload.single('image--upload'), function(errors, req, res, next) {
  console.log(req.body);
  res.render('register', { title: 'Register', errors });
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
