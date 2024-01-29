const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, unique: true, required: true },
  url: { type: String, required: true },
  shortUrl: { type: String,required:true }
});

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
