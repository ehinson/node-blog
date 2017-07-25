var express = require('express');
var router = express.Router();

/* GET posts/add listing. */
router.get('/add', function(req, res, next) {
  res.render('addpost', {
    title: 'Add a Post'
  });
});

module.exports = router;
