const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const Document =new Schema({
    _id: String,
    data: Object
})
module.exports=model('Document',Document)