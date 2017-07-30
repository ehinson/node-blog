var express = require('express');
var router = express.Router();
const multer = require('multer');
var upload = multer({ dest: 'public/images/uploads/' });


const mongo = require('mongodb');
var db = require('monk')('mongodb://localhost/nodeblog');


/* GET posts/show/:id listing. */
router.get('/show/:id', function(req, res, next) {
  var posts = db.get('posts');
  posts.findById(req.params.id, (err, post) => {
    if (err) {
      console.error(err);
    } else {
      res.render('show', {
        title: 'Add a Post',
        post: post
      });
    }
  });
});

/* GET posts/add listing. */
router.get('/add', function(req, res, next) {
  var categories = db.get('categories');
  categories.find({}, {}, (err, cat) => {
    if (err) {
      console.error(err);
    } else {
      res.render('addpost', {
        title: 'Add a Post',
        categories: cat
      });
    }
  });
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
    var mainimage = req.file.filename;
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
      }}, (err, res) => {
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
