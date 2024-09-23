// friendRequestRoutes.js

const express = require('express');
const router = express.Router();
const FriendRequest = require('../models/FriendRequest');
const { verifyToken } = require('../middlewares/authMiddleware'); // Ensure middleware is correctly imported

// Send a friend request
router.post('/send-friend-request', verifyToken, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id; // This should be set by verifyToken

  try {
    // Check if a friend request already exists
    const existingRequest = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Create a new friend request
    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
    });

    await friendRequest.save();
    res.status(201).json({ message: 'Friend request sent' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
