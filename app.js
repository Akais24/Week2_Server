// app.js

// [LOAD PACKAGES]
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var fs = require('fs');

// bodyParser = {
//   json: {limit: '50mb', extended: true},
//   urlencoded: {limit: '50mb', extended: true}
// };

// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.json({limit : '50mb'}))
app.use(bodyParser.urlencoded({ extended: true, limit : '50mb' }));

// [CONFIGURE SERVER PORT]
//var port = process.env.PORT || 8080;
var port = 60722;

// DEFINE MODEL
var User = require('./models/user');
var Savedimage = require('./models/savedimage');
var Contact = require('./models/contact');

// [CONFIGURE ROUTER]
var router = require('./routes')(app, fs, User, Savedimage, Contact);

// ...
// [RUN SERVER]
var server = app.listen(port, function(){
 console.log("Express server has started on port " + port)
});

// [ CONFIGURE mongoose ]

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

mongoose.connect('mongodb://localhost/2ndPJ');
