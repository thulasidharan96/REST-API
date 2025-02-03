// /routes/studentAttendance.js

const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");
const StudentAttendance = require("../models/studentAttendance");
const checkAuth = require("../middleware/check-auth");
const checkadmin = require("../middleware/checkadmin");

router.get("/",checkAuth,checkadmin, (req, res, next) => {
    const currentDate = moment
      .tz(new Date(), "Asia/Kolkata")
      .format("YYYY-MM-DD");
    console.log("Current Date:", currentDate);
  
    StudentAttendance.find({ dateOnly: currentDate })
      .select("userId attendanceStatus _id dateOnly department")
      .exec()
      .then((docs) => {
        console.log("Query result:", docs);  // Log to debug
        const response = {
          count: docs.length,
          studentAttendance: docs.map((doc) => {
            return {
              userId: doc.userId,
              attendanceStatus: doc.attendanceStatus,
              _id: doc._id,
              dateOnly: doc.dateOnly,
              department: doc.department,
              request: {
                type: "GET",
                url: `http://localhost:3000/studentAttendance/${doc._id}`,
              },
            };
          }),
        };
        res.status(200).json(response); // Return the query results
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  });
 
// router.get('/', (req, res, next) => {
//     res.send('Admin page accessed!');
// });

module.exports = router;
