const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/jwt.middleware.js");
const mongoose = require("mongoose");
const Log = require("../models/Log.model.js");
const User = require("../models/User.model.js");

// POST /log - Create a new log and associate it with the user
router.post("/log", isAuthenticated, (req, res, next) => {
  const { name, co2, points } = req.body;

  // Access the authenticated user's ID from req.payload (this comes from the isAuthenticated middleware)
  const userId = req.payload._id;

  // Create a new log and associate the user with it
  Log.create({ name, co2, points, user: userId })
    .then((log) => {
      // Once the log is created, add it to the user's log array
      return User.findByIdAndUpdate(
        userId,
        { $push: { log: log._id } },
        { new: true }
      );
    })
    .then((updatedUser) => {
      res.status(201).json({
        message: "Activity loaded and associated with user",
        user: updatedUser,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ message: "Something went wrong while saving the log." });
    });
});

// GET /logs - Get all logs of the current authenticated user
router.get("/logs", isAuthenticated, (req, res, next) => {
  // Access the authenticated user's ID from req.payload
  const userId = req.payload._id;

  // Find the logs that belong to the authenticated user
  Log.find({ user: userId })
    .then((userLogs) => {
      // Return the logs associated with the current user
      res.status(200).json(userLogs);
    })
    .catch((err) => {
      // Handle any errors that occur during the database query
      console.log(err);
      res
        .status(500)
        .json({ message: "Something went wrong while fetching the logs." });
    });
});

router.delete("/logs/:logId", (req, res, next) => {
  const { logId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(logId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Log.findByIdAndRemove(logId)
    .then(() =>
      res.json({
        message: `Activity with ${logId} is removed successfully.`,
      })
    )
    .catch((error) => res.json(error));
});

module.exports = router;
