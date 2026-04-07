const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: String,
  file: String,
  notes: String,
  grade: Number,
  feedback: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const assignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  courseId: String,
  teacherId: String,
  deadline: Date,
  submissions: [submissionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);