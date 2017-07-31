var express = require('express');
var router = express.Router();

const mongo = require('mongodb');
var db = require('monk')( process.env.MONGODB_URI || 'mongodb://localhost/nodeblog');


/* GET categories/add listing. */
router.get('/show/:category', function(req, res, next) {
  var posts = db.get('posts');
  posts.find({category: req.params.category}, {}, (err, posts) => {
    if (err) {
      console.error(err);
    } else {
      res.render('index', {
        title: req.params.category,
        posts: posts
      });
    }
  });
});

/* GET categories/add listing. */
router.get('/add', function(req, res, next) {
  res.render('addcategory', {
    title: 'Add a Category'
  });
});

/* POST categories/add listing. */
router.post('/add', function(req, res, next) {
  var name = req.body.name;

  //Validation
  req.checkBody('name', 'Name is required').notEmpty();

  var errors = req.getValidationResult().then(result => {
    if (!result.isEmpty()) {
      res.render('addcategory', {
        errors
      });
    } else {
      var categories = db.get('categories');
      categories.insert({ name }, (err, post) => {
        if (err) {
          res.send(err);
        } else {
          req.flash('success', 'Category Added');
          res.location('/');
          res.redirect('/');
        }
      });
    }
  });
});

module.exports = router;
