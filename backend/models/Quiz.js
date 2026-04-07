const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number
});

const attemptSchema = new mongoose.Schema({
  studentId: String,
  answers: [Number],
  score: Number,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const quizSchema = new mongoose.Schema({
  title: String,
  courseId: String,
  teacherId: String,
  duration: Number, // in minutes
  questions: [questionSchema],
  attempts: [attemptSchema]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);