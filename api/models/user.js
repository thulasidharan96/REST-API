const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    },
    password: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

module.exports = mongoose.model('User', userSchema);
