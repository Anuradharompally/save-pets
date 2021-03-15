var express = require("express");
var multer = require("multer");
var cloudinary = require('cloudinary');
var path = require('path');
var fs = require('fs');
var assert = require('assert');
require('dotenv').config();
require('./handlers/cloudinary');
var upload = require('./handlers/multer');
var ObjectId = require('mongodb').ObjectID;
var tinify = require('tinify');  //it is required for image compression 
var helper = require('sendgrid').mail; // it required for sending mail


tinify.key = process.env.TINIFY_KEY;
var router = express.Router();



//db setup 

router.use(express.urlencoded({ extended: true }));
router.use(express.json({ extended: true }));

var db;

router.use(function (req, res, next) {
  if (req.session.loggedIn) {
    next();
  }
  else {
    res.redirect("/login");
  }
});
//adding new petsinfo in the database 
router.post('/', upload.single('File'), async (req, res) => {
  db = req.app.locals.db;
  var destination = '/tmp/' + req.file.filename;

  var source = await tinify.fromFile(req.file.path);
  await source.toFile(destination);

  console.log("Filename : " + req.file.path);
  starter();
  function starter() {
    //checking file type
    fs.stat("/tmp/" + req.file.filename, async function (err, stats) {

      if (err) {
        console.log("error occcour");
        starter();
      } else {

        //wait for the result
        var result = await cloudinary.v2.uploader.upload(destination);

        //sending response it have to be changed;
        req.body.public_id = result.public_id;
        req.body.url = result.secure_url;
        req.body.likes_count = 0;
        req.body.requestedUser = [];
        req.body.adopted = false;
        db.collection('petsinfo').insertOne(req.body, (error, addedPetinfo) => {
          assert.equal(null, error);
          //adding newAdded petid into user collection inplace of sadabahmad req.session.username  
          db.collection('userinfo').updateOne({ username: req.session.username }, { $push: { petAdded: addedPetinfo.insertedId } }, function (error) {
            assert.equal(null, error);
          });
          // inplace of sadabahmad req.session.username 
          res.redirect(`/userprofile/${req.session.username}`);

        });
      }

    });

  }
});


//getting add pet routes

router.get("/addpet", (req, res) => {

  res.render("addpet", {
    user: req.session.username,
    loggedin: req.session.loggedIn,
    temp: true,
    title: 'Add Pets'
  })
});

//updating pets info using form ...

router.put('/update/:id', (req, res) => {
  if (req.session.loggedIn) {
    db = req.app.locals.db;

    console.log(req.body);
    console.log("id is ", req.params.id)

    db.collection('petsinfo').updateOne({ _id: ObjectId(req.params.id) }, {
      $set: {
        name: req.body.name,
        age: req.body.age,
        vaccinated: req.body.vaccinated,
        trained: req.body.trained,
        category: req.body.category,
        breeds: req.body.breeds,
        location: req.body.location,
        color: req.body.color,
        email: req.body.email,
        phone: req.body.phone,
        description: req.body.description
      }
    }, (error, result) => {
      assert.equal(null, error);

      db.collection('adoptrequest').updateMany({ pet_id: req.params.id }, {
        $set: {
          pet_name: req.body.name,
          pet_age: req.body.age,
          breeds: req.body.breeds,
          url: req.body.url
        }
      })

      res.json(req.session.username);
    });
  }
  else {

    res.json("login");
  }


});



router.post('/like/:id/', async (req, res) => {
  var db = req.app.locals.db;

  if (req.session.loggedIn) {
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
          console.log("dislike ", likeRes.value.likes_count)
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
  } else {

    res.json("login");
  }

});




module.exports = router;