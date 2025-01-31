const mongoose = require('mongoose');
const moment = require('moment-timezone'); // Import moment-timezone for timezone handling

// Define the schema for student attendance
const studentAttendanceSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // Unique identifier for each record
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Ensure the user ID is mandatory
  },
  dateTime: {
    type: Date,
    required: true,
    // Automatically set attendance time in India/Kolkata timezone
    default: () => moment.tz(new Date(), "Asia/Kolkata").toDate()
  },
  attendanceStatus: {
    type: String,
    required: true,
    enum: ['present', 'absent', 'late'], // Allow only specific attendance statuses
    default: 'present' // Default to "present"
  },
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'EEE', 'MECH'], // Restrict departments to a predefined list
    default: 'CSE' // Default department is "CSE"
  }
});

// Index to prevent duplicate attendance records for the same user on the same date and time
studentAttendanceSchema.index({ userId: 1, dateTime: 1 }, { unique: true });

module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema);
