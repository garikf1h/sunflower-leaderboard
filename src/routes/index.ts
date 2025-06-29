import express from 'express'
import {
  addUserWithScore,
  updateUserScore,
  getTopUsers,
  getUserAndSurroundingScore, // Using the efficient version I shared earlier
} from '../controllers'

const router = express.Router()

// Add a new user with a score
router.post('/users', addUserWithScore)

// Update a user's score
router.put('/users/:id/score', updateUserScore)

// Get top N users on the leaderboard
router.get('/leaderboard/top', getTopUsers)

// Get user's position with 5 above and below
router.get('/leaderboard/user/:id', getUserAndSurroundingScore)

export default router