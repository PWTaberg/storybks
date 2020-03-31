const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema for Google user
// I named it GoogleUser because we already have a user table
// Rename later ...
const GoogleUserSchema = new Schema({
  googleID: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  image: {
    type: String
  }
});

// Create collection and add schema
// Change to users or google_users
mongoose.model('google_users', GoogleUserSchema);
