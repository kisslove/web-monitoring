var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    email: String,
    password:String,
    phone: String,
    isAcitve: { type: Boolean, default: false },
    createTime: { type: Date, default: Date.now },
    id: Schema.Types.ObjectId,
    token:String
});

module.exports = mongoose.model('UserDataInfo', schema);