var aws = require('aws-sdk')

var express = require('express');
var router = express.Router();
const multer = require('multer');
// var upload = multer({ dest: 'public/images/uploads/' });
var multerS3 = require('multer-s3')


const mongo = require('mongodb');
var db = require('monk')( process.env.MONGODB_URI || 'mongodb://localhost/nodeblog');

var albumBucketName = 'bloggerin';
var bucketRegion = 'us-east-1';


aws.config.update({
  region: bucketRegion,
  credentials: new aws.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:c01d6ca1-d006-4999-b746-d4e014099cda'
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


/* GET posts/show/:id listing. */
router.get('/show/:id', function(req, res, next) {
  var posts = db.get('posts');

  posts.findById(req.params.id, (err, post) => {
    if (err) {
      console.error(err);
    } else {
      db.get('users').findOne({username: post.author}, (err, author) => {
        if (err){
          console.log(err);
        }
        else {
          console.log(author);
          res.render('show', {
            title: 'Add a Post',
            post: post,
            author
          });
        }
      })
    }
  });
});

/* GET posts/add listing. */
router.get('/add', function(req, res, next) {
  var categories = db.get('categories');
  var users = db.get('users').find({}, {}, (err, docs) => {
    console.log(docs);
    categories.find({}, {}, (err, cat) => {
      if (err) {
        console.error(err);
      } else {
        res.render('addpost', {
          title: 'Add a Post',
          categories: cat,
          users: docs
        });
      }
    });
  })

});

/* POST posts/add listing. */
router.post('/add', upload.single('image--upload'), function(req, res, next) {
  var title = req.body.title;
  var author = req.body.author;
  var category = req.body.category;
  var body = JSON.stringify(req.body.body);
  var date = new Date();
  console.log(req.file);
  if (req.file) {

    var mainimage = req.file.key;
  } else {
    var mainimage = 'no-image.jpg';
  }

  //Validation
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('body', 'A message is required').notEmpty();

  var errors = req.getValidationResult().then(result => {
    if (!result.isEmpty()) {
      res.render('addpost', {
        title: 'Error',
        errors
      });
    } else {
      var posts = db.get('posts');
      posts.insert({ title, author, category, date, mainimage, body }, (err, post) => {
        if (err) {
          res.send(err);
        } else {
          req.flash('success', 'Post Added');
          res.location('/');
          res.redirect('/');
        }
      });
    }
  });
});

/* POST posts/addcomment listing. */
router.post('/addcomment', function(req, res, next) {

  var name = req.body.comment__name;
  var postid = req.body.post__id;
  var email = req.body.comment__email;
  var body = req.body.comment__body;
  var date = new Date();
   console.log(req.body);

  //Validation
  req.checkBody('comment__name', 'Name is required').notEmpty();
  req.checkBody('comment__email', 'Email is required but never displayed').notEmpty();
  req.checkBody('comment__email', 'Email is not valid').isEmail();

  var errors = req.getValidationResult().then(result => {
    if (!result.isEmpty()) {
      var posts = db.get('posts');
      posts.findById(postid, (err, post) => {
        if (err) {
          console.error("Error finding by One", err)
        } else {
          console.log("Showing with errors", result.array());
          res.render('show', {
            title: 'Add a Post',
            errors: result.array(),
            post: post
          });
        }
      });

    } else {
      var comment = {
        name: name,
        email: email,
        body: body,
        commentdate: date
      }
      var posts = db.get('posts');
      posts.update({ _id: postid }, { $push : {
        "comments": comment
      }}, (err, result) => {
        if (err) {
          throw err;
        } else {
          req.flash('success', 'Comment Added');
          res.location('/posts/show/'+ postid);
          res.redirect('/posts/show/'+ postid);
        }
      });
    }
  });
});

module.exports = router;
