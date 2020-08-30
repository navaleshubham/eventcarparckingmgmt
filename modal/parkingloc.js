const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Parkinglo = new Schema({
    id:{
        type:Number,
        required:true,
        unique:true
    },
    isempty:{
        type:Boolean,
        required:true
    }
})
module.exports = Parkingloc = mongoose.model('Parkingloc',Parkinglo);