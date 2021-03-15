var express = require("express");
var router = express.Router();

router.get("/:id", async function (req, res) {
    var db = req.app.locals.db;
    db.collection("petsinfo").find({ _id: require("mongodb").ObjectId(req.params.id) }).toArray(function (err, result) {
        if (err) throw err;
        res.render("petprofile", {
            petprofile: result[0],
            title: result[0].name,
            loggedin: req.session.loggedIn,

        });
    });
});
module.exports = router