const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const deepEmailValidator = require('deep-email-validator');
const { attachToken, verifyToken } = require('../middlewares/authMiddleware');

async function validateEmail(email) {
    const result = await deepEmailValidator.validate(email);
    return result;
}

function getCustomErrorMessage(validation) {
    if (!validation.valid) {
        switch (validation.reason) {
            case 'format':
                return 'Invalid email format';
            case 'domain':
                return 'Email domain does not exist';
            case 'smtp':
                return 'Invalid email address';
            default:
                return 'Invalid email address';
        }
    }
    return '';
}

// Route for signup
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }
    const emailValidation = await validateEmail(email);
    if (!emailValidation.valid) {
        const customMessage = getCustomErrorMessage(emailValidation);
        return res.status(400).json({ message: customMessage });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        req.userId = newUser._id;
        await attachToken(req, res, () => {
            res.status(201).json({ message: 'User created successfully', token: res.locals.token });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route for login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        req.userId = user._id;
        await attachToken(req, res, () => {
            res.status(200).json({ message: 'Login successful', token: res.locals.token });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
