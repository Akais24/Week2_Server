var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var siSchema = new Schema({
    owner: String,
    name : String,
    m_date: String,
});

module.exports = mongoose.model('savedimage', siSchema);
