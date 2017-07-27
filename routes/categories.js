var express = require('express');
var router = express.Router();

const mongo = require('mongodb');
var db = require('monk')('mongodb://localhost/nodeblog');

/* GET categories/add listing. */
router.get('/add', function(req, res, next) {
  res.render('addcategory', {
    title: 'Add a Category'
  });
});

/* POST posts/add listing. */
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
