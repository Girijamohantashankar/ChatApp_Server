const express = require('express');
const router = express.Router();
const FriendRequest = require('../models/FriendRequest');
const { verifyToken } = require('../middlewares/authMiddleware');

// Send a friend request
router.post('/send-friend-request', verifyToken, async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;

  try {
    const existingRequest = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Friend request already sent' });
    }
    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
    });

    await friendRequest.save();
    res.status(201).json({ success: true, message: 'Friend request sent' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Fetch friend requests for a user
router.get('/friend-requests', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const requests = await FriendRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).populate('sender receiver', 'userName'); // Adjust to include relevant user data

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Accept a friend request
router.post('/accept-friend-request', verifyToken, async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user.id;

  try {
    const request = await FriendRequest.findById(requestId);

    if (!request || request.receiver.toString() !== userId) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    request.status = 'accepted';
    await request.save();
    await User.findByIdAndUpdate(request.sender, { $push: { friends: userId } });
    await User.findByIdAndUpdate(userId, { $push: { friends: request.sender } });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Reject a friend request
router.post('/reject-friend-request', verifyToken, async (req, res) => {
  const { requestId } = req.body;
  const userId = req.user.id;

  try {
    const request = await FriendRequest.findById(requestId);

    if (!request || request.receiver.toString() !== userId) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Remove the friend request from the database
    await request.remove();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
