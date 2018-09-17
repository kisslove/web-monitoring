var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now },
    page: String,
    type: String,
    appKey: Schema.Types.ObjectId,
    os: String,
    bs: String,
    pageWh: String,
    ua: String,
    city_nameCN: String,
    country_nameCN: String,
    latitude: Number,
    longitude: Number,
    mostSpecificSubdivision_nameCN: String,
    onlineip: String,
    isp: String,
    organizationCN: String,
    error: String
});

module.exports = mongoose.model('JsDataInfo', schema);