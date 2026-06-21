const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  userId: String,
  type: String,
  amount: Number,
  note: String
});

module.exports = mongoose.model("Account", accountSchema);