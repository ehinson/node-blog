var express = require('express');
var router = express.Router();
const multer = require('multer');
var upload = multer({ dest: 'uploads/' });

const mongo = require('mongodb');
var db = require('monk')('mongodb://localhost/nodeblog');

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
  var body = req.body.body;
  var date = new Date();
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
        errors
      });
    } else {
      var posts = db.get('posts');
      posts.insert({ title: title, author: author, category, date, mainimage }, (err, post) => {
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

module.exports = router;
