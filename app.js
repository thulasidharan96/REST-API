const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const userRoutes = require('./api/routes/user');
const attendanceRoutes = require('./api/routes/attendance');
const adminRoutes = require('./api/routes/admin');

// ✅ Connect to MongoDB (without deprecated options)
mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise;

// ✅ Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ✅ CORS Headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// ✅ Add a working route for `/`
app.get('/', (req, res) => {
    res.send('Server is live! 🚀');
});

// ✅ Define API Routes
app.use('/user', userRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/getAttendance', attendanceRoutes);
app.use('/admin', adminRoutes);

// ✅ 404 Handler (after all routes)
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// ✅ Error Handling Middleware
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({ error: { message: error.message } });
});

module.exports = app;
