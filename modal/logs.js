const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PLog = new Schema({
    name:{
        type:String,
        required:true
    },
    mob_no:{
        type:Number,
        required:true,
    },
    car_no:{
        type:String,
        unique:true,
        required:true
    },
    in_time:{
        type:Date,
        required:true
    },
    out_time:{
        type:Date
    },
    park_loc:{
        type:Number,
        unique:true,
        required:true
    },
    isparked:{
        type:Boolean,
        required:true
    }
})
module.exports = PLogs = mongoose.model('Plogs',PLog);