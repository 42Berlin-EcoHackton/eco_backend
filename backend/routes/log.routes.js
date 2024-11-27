const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/jwt.middleware.js');
const mongoose = require('mongoose');
const TransportLog = require('../models/TransportLog.model.js');
const FoodLog = require('../models/FoodLog.model.js');
const User = require('../models/User.model.js');

// POST /log - Create a new log and associate it with the user
router.post('/log_transport', isAuthenticated, (req, res, next) => {
  const { name, co2, points } = req.body;

  // Access the authenticated user's ID from req.payload (this comes from the isAuthenticated middleware)
  const userId = req.payload._id;

  // Create a new log and associate the user with it
  TransportLog.create({ name, co2, points, user: userId })
    .then((transport_log) => {
      // Once the log is created, add it to the user's log array
      return User.findByIdAndUpdate(
        userId,
        { $push: { transport_log: transport_log._id } },
        { new: true }
      );
    })
    .then((updatedUser) => {
      res.status(201).json({
        message: 'Transport activity loaded and associated with user',
        user: updatedUser,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ message: 'Something went wrong while saving the log.' });
    });
});

router.post('/log_food', isAuthenticated, (req, res, next) => {
  const { name, co2, points } = req.body;

  // Access the authenticated user's ID from req.payload (this comes from the isAuthenticated middleware)
  const userId = req.payload._id;

  // Create a new log and associate the user with it
  FoodLog.create({ name, co2, points, user: userId })
    .then((food_log) => {
      // Once the log is created, add it to the user's log array
      return User.findByIdAndUpdate(
        userId,
        { $push: { food_log: food_log._id } },
        { new: true }
      );
    })
    .then((updatedUser) => {
      res.status(201).json({
        message: 'Food activity loaded and associated with user',
        user: updatedUser,
      });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ message: 'Something went wrong while saving the log.' });
    });
});
// GET /logs - Get all logs of the current authenticated user
router.get('/logs', isAuthenticated, (req, res, next) => {
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
        .json({ message: 'Something went wrong while fetching the logs.' });
    });
});

router.delete('/logs/:logId', (req, res, next) => {
  const { logId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(logId)) {
    res.status(400).json({ message: 'Specified id is not valid' });
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

// GET /score - Get the total score (sum of points) for the current user
router.get('/score', isAuthenticated, async (req, res, next) => {
  const userId = req.payload._id;

  try {
    // Aggregate the points from all logs associated with this user
    const result = await Log.aggregate([
      { $match: { user: userId } }, // Match logs for the authenticated user
      { $group: { _id: null, totalPoints: { $sum: '$points' } } }, // Sum the points
    ]);

    if (result.length > 0) {
      res.status(200).json({ totalPoints: result[0].totalPoints });
    } else {
      res.status(200).json({ totalPoints: 0 }); // If no logs, return 0 points
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to fetch score' });
  }
});

module.exports = router;
