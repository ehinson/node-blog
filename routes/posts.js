var express = require('express');
var router = express.Router();
const multer = require('multer');
var upload = multer({ dest: 'uploads/' });

/* GET posts/add listing. */
router.get('/add', function(req, res, next) {
  res.render('addpost', {
    title: 'Add a Post'
  });
});

/* POST posts/add listing. */
router.post('/add', upload.single('image--upload'), function(req, res, next) {
  var title = req.body.title;
  var author = req.body.author;
  var category = req.body.category;
  var body = req.body.body;
  var date = new Date();
  console.log(req.body);
});

module.exports = router;
