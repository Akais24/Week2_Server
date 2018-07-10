var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    alias: String,
    unique_id: String,
    published_date: String
});

module.exports = mongoose.model('user', userSchema);
