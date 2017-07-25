var express = require('express');
var router = express.Router();
const mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

/* GET home page. */
router.get('/', function(req, res, next) {
  db = req.db;
  var posts = db.get('posts');
  posts.find({}, {}, (err, posts) => {
    if (err) {
      console.error(err);
    }
    res.render('index', { posts: posts, title: 'Node Express Blog' });
  });
});

module.exports = router;
