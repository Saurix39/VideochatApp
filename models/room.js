'use strict';
var mongoose = require("mongoose");
var schema = mongoose.Schema;
var roomSchema = schema({
    name: String,
    hashedname:String,
    password: String
});

module.exports = mongoose.model("Room",roomSchema);