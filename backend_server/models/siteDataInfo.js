// import { mongoose } from "mongoose";
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    appName: String,
    disableHook: Boolean,
    disableJS: Boolean,
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now },
    appKey: Schema.Types.ObjectId,
    id: Schema.Types.ObjectId,
    state: String
});

module.exports = mongoose.model('SiteDataInfo', schema);