var aws = require('aws-sdk');
var express = require('express');
const multer = require('multer');
var router = express.Router();
var multerS3 = require('multer-s3');
const bcrypt = require('bcryptjs');
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

router.post('/register', upload.single('avatar__image--upload'), function( req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password__confirmation;
  console.log(password, password2);

  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'Valid email is required').notEmpty();
  req.checkBody('email', 'Valid email is required').isEmail();
  req.checkBody('password', '6 to 18 characters required in password').len(6, 18);
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password__confirmation', 'Passwords must match').equals(req.body.password);

  req.getValidationResult().then(result => {
    if (!result.isEmpty()) {
      console.log(result.array());
      res.render('register', { title: 'Register', errors: result.array() });
    } else {

bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
          var newUser =  {
          username: username,
          email: email,
          name: name,
          avatar: avatar,
          password: hash
        };
        users.insert(newUser, (err, user) => {
          if(err){
            console.log(err);
          }else {
            console.log(user);
          }
        });
      });
  });
  if (req.file) {
    console.log('Uploading File', req.file);
    var avatar = req.file.key;
  } else {
    console.log('No file uploaded');
    var avatar = 'default-avatar.png';
  }


  req.flash('success', 'You are now registered. You can now login.');
  res.location('/users/login');
  res.redirect('/users/login');
}
})
});

router.get('/login', function( req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }), function(req, res) {
  req.flash('success', 'You are now logged in. Welcome Home.');
  res.redirect('/');
});

router.get('/logout', function(req, res, next) {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});


function validPassword(enteredPassword, hash, callback){

}

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  users.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    users.findOne({ username: username }, function(err, user) {

      if (err) { console.log(err); return done(err); }
      if (!user) {
        return done(null, false, { message: 'Invalid username' });

      }

      bcrypt.compare(password, user.password).then(res => {
        if (res){
          return done(null, user);
        }
        else {
          return done(null, false, { message: 'Invalid password' });
        }
      })


    });
  }
));

module.exports = router;
