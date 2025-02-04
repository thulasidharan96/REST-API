const mongoose = require('mongoose');
const moment = require('moment-timezone');

const studentAttendanceSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true
  },
  dateOnly: {
    type: String,
    required: true,
    default: () => moment.tz(new Date(), "Asia/Kolkata").format('YYYY-MM-DD') // Only stores date part
  },
  attendanceStatus: {
    type: String,
    required: true,
    enum: ['present', 'leave'],
    default: 'present'
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'EEE', 'MECH'],
    default: 'CSE'
  }
});

// Unique index to ensure a user can only have one attendance per day
studentAttendanceSchema.index({ userId: 1, dateOnly: 1 }, { unique: true });

module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema);
