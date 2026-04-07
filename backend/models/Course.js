const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  teacherId: String,
  students: [String]
});

module.exports = mongoose.model('Course', courseSchema);