var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
var monk = require('monk');
var db = monk('mongodb://localhost/nodeblog');

/* GET home page. */
router.get('/', function(req, res, next) {
  db = req.db;
  var posts = db.get('posts');
  // posts.find({}, {}).then(function() {
  //   res.render('index', { title: 'Node Express Blog', posts: posts });
  // });
  posts.find({}, {}, (err, post) => {
    if (err) {
      console.error(err);
    } else {
      res.render('index', { title: 'Node Express Blog', posts: post });
    }
  });
});

module.exports = router;
