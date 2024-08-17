var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// router.get("/:student", function (req, res) {
//   title = req.params.student;
//   res.render("student", { title: title });
// });

router.get("/data", function (req, res) {
  res.json({ message: "Hello World JSON" });
});

// Handle invalid request
router.use(function(req, res, next) {
  res.status(404).send("Invalid request");
});

module.exports = router;
