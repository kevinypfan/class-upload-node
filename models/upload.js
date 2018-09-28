const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  createAt: {
    type: Date,
    default: Date.now()
  },
  filePath: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Upload', schema);