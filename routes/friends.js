const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.get('/friends', async (req, res) => {
    try {
        const users = await User.find();
        console.log(users);
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
