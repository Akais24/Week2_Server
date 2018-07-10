var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactSchema = new Schema({
    owner: String,
    name: String,
    number: String,
    email : String,
    // modified_date: { type: Date, default: Date.now  }
});

module.exports = mongoose.model('contact', contactSchema);
