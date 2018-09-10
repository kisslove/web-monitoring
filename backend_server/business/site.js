var SiteModel = require('../models/siteModel');
var util = require('../utils/util');
var mongoose = require('mongoose');
/* system listing. */
exports.list = function(req, res, next) {
    SiteModel.find({}, function(err, r) {
        if (!err) {
            res.json(util.resJson({
                IsSuccess: true,
                Data: r
            }));
        } else {
            res.json(util.resJson({
                IsSuccess: false,
                Data: null
            }));
        }
    })
};

exports.create = function(req, res, next) {
    var ObjectId = mongoose.Types.ObjectId;
    var id1 = new ObjectId;
    var temp = new SiteModel({
        appName: req.body.appName,
        disableHook: true,
        disableJS: false,
        appKey: id1,
        id: id1
    });
    temp.save(function(err, r) {
        console.log(err);

        if (!err) {
            res.json(util.resJson({
                IsSuccess: true,
                Data: r
            }));
        } else {
            res.json(util.resJson({
                IsSuccess: false,
                Data: null
            }));
        }
    });

};