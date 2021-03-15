var express = require("express");
var router = express.Router();
var ObjectId = require("mongodb").ObjectId;

router.use(express.json({ extended: true }));

router.get('/', async function (req, res) {
  var db = req.app.locals.db;
  const like = await db.collection('likes').find({ $and: [{ username: req.session.username }, { category: "dog" }] }).toArray();
  let likeSet = new Set(like.map(elem => elem.pet_id));

  db.collection("petsinfo").find({ category: "dog" }).sort({ _id: -1 }).toArray(function (err, result) {
    if (err) throw err;
    let liked = [];

    result.forEach((element, index) => {


      if (index < like.length && likeSet.has(element._id.toString())) {
        liked.push({ pets: element, like: true });
      }
      else {
        liked.push({ pets: element, like: false });
      }
      element.location = element.location.value.split(",")[0];
    });

    res.render("pets", {
      pets: liked,
      title: "Dogs",
      style: "cards.css",
      script: "doglikes.js",
      loggedin: req.session.loggedIn,
      user: req.session.username
    });

  });
});
router.use(function (req, res, next) {
  if (req.session.loggedIn) {
    next();
  }
  else {
    res.redirect("/login");
  }
});
router.post('/like/:id/', async (req, res) => {
  var db = req.app.locals.db;

  let pet = await db.collection("likes").findOne({
    $and: [{ username: req.session.username },
    { pet_id: req.params.id }]
  });

  if (pet) {
    let temp = await db.collection("likes").deleteOne({
      $and: [{ username: req.session.username },
      { pet_id: req.params.id }]
    });
    db.collection("petsinfo").findOneAndUpdate({ _id: ObjectId(req.params.id) },
      { $inc: { likes_count: -1 } }, function (err, likeRes) {

        res.json({ likes: likeRes.value.likes_count - 1 });
      });
  }
  else {
    var data = {
      "username": req.session.username,
      "pet_id": req.params.id,
      "category": "dog"
    }
    db.collection("likes").insertOne(data, function (err, likeRes) {
      if (err) throw err;

      db.collection("petsinfo").findOneAndUpdate({ _id: ObjectId(req.params.id) },
        { $inc: { likes_count: 1 } }, function (err, likeRes) {
          res.json({ likes: likeRes.value.likes_count + 1, like: true });
        });
    });

  }

});


module.exports = router;
