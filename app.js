const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const friendsRoutes = require('./routes/friends');
const friendRequestRoutes = require('./routes/friendRequest');


// Use routes
app.use('/api/auth', authRoutes);
app.use('/api', friendsRoutes);
app.use('/api', friendRequestRoutes);



// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
