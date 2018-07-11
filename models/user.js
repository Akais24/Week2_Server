var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    alias: String,
    unique_id: String,
    published_date: String,
    point : Number,
    isprofile : Number
});

module.exports = mongoose.model('user', userSchema);
