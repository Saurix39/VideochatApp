'use strict';
var mongoose = require("mongoose");
var schema = mongoose.Schema;
var userSchema = schema({
    correo: String,
    nick : String,
    password : String
});

module.exports = mongoose.model('User',userSchema);