

// const mongoose = require('mongoose');


// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   password: { type: String, required: true }, // hashed
//   address: { type: String },
//   salary: { type: Number },
//   phoneNumber: { type: String, required: true }
// }, { timestamps: true }); // This adds createdAt and updatedAt fields

// module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  address: { type: String },
  salary: { type: Number },
  phoneNumber: { type: String, required: true },
  imagePath: { type: String }, // NEW: to store image file path
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
