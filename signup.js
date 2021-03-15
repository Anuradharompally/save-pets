var express = require("express");
var router = express.Router();
router.use(express.urlencoded({ extended: true }));
router.get("/", function (req, res) {
  res.render("signup", {
    layout: false,
    title: 'Signup',
    script: '/signupPage.js'
  });
});
router.post('/', function (req, res) {
  var db = req.app.locals.db;
  var md5 = req.app.locals.md5;
  var newUser = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    username: req.body.username,
    password: md5(req.body.password),
    petAdded: [],
    petLiked: [],
    requestedPet: []
  };
  db.collection('userinfo').find({}).toArray(function (error, result) {
    var flag = false;
    if (error) throw error
    for (var i = 0; i < result.length; i++) {
      if (req.body.username == result[i].username || req.body.email == result[i].email) {
        flag = true
        res.render("signup", {
          layout: false,
          title: 'Signup',
          script: '/signupPage.js',
          msg: 'Username or email already exists'
        });
      }
    }
    if (!flag) {
      db.collection('userinfo').insertOne(newUser, function (err, result) {
        if (err) throw err;
        res.redirect('/login');
      });
    }
  })
});
module.exports = router; 