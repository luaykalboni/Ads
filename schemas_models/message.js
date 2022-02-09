const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({

clientId : String,   
text : [],
picture : String,
template : String,
length : String,
date : {

    year : Number,
    month : [],
    startDateDay : [],
    endDateDay : [],
    days : [],
    startHour : Number,
    endHour : Number,
    }
});

const Message = mongoose.model('message', messageSchema);

module.exports = Message;