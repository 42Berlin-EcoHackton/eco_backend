const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.json("Green Backend is live!!!");
});

module.exports = router;
