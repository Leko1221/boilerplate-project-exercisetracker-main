const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Exercise = require('../models/exercise');

// POST /api/users
router.post('/users', async (req, res) => {
  const user = new User({ username: req.body.username });
  const savedUser = await user.save();
  res.json({ username: savedUser.username, _id: savedUser._id });
});

// GET /api/users
router.get('/users', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// POST /api/users/:_id/exercises
router.post('/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const user = await User.findById(req.params._id);
  const exercise = new Exercise({
    userId: user._id,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date()
  });
  const savedExercise = await exercise.save();
  res.json({
    _id: user._id,
    username: user.username,
    date: savedExercise.date.toDateString(),
    duration: savedExercise.duration,
    description: savedExercise.description
  });
});

// GET /api/users/:_id/logs
router.get('/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const user = await User.findById(req.params._id);
  let filter = { userId: user._id };

  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  let query = Exercise.find(filter);
  if (limit) query = query.limit(parseInt(limit));

  const exercises = await query.exec();

  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log: exercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }))
  });
});

module.exports = router;
