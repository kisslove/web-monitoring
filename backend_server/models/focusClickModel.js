var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    createTime: { type: Date, default: Date.now },
    updateTime: { type: Date, default: Date.now },
    type: String,
    page: String,
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
    title: String,
    href: String,
    text: String
});

module.exports = mongoose.model('FocusClickModel', schema);