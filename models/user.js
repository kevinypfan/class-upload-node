const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  tokens: [{
    token: {
      type: String
    }
  }]
})

schema.methods.generateAuthToken = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toHexString() }, 'abc123').toString();
  user.tokens.push({ token });
  return user.save().then(() => {
    return { token }
  })
};

schema.methods.userAuthentication = function (password) {
  const user = this;
  return bcrypt.compare(password, user.password)
}

schema.pre('save', function (next) {
  var user = this;
  if (user.isModified('password')) {
    bcrypt.hash(user.password, 10).then(hash => {
      user.password = hash;
      next();
    })
  } else {
    next();
  }
})

module.exports = mongoose.model('User', schema);