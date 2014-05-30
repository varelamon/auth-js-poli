var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
  text: { type: String, unique: true}
});


module.exports = mongoose.model('Question', questionSchema);
