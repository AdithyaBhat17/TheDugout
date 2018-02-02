var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
module.exports = mongoose.model("Blog",blogSchema);