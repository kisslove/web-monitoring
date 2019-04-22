var Mongoose = require('mongoose');
var ResourceModel = require('../models/resourceModel');
var _ = require('lodash');
var util = require('../utils/util');

/**
 * API请求-list
 * @param {*} req 
 */
exports.list = async(req) => {
    let appKey = new Mongoose.Types.ObjectId(req.body.appKey);
    let body = util.computeSTimeAndEtime(req.body);
    let resJson = {
        List: [],
        TotalCount: 0
    };
    let tempCon = {
        "createTime": {
            '$gte': body.sTime,
            '$lt': body.eTime
        },
        "appKey": appKey,
        $or: [{
            "page": {
                '$regex': new RegExp(`${req.body.keywords}.*`, "gi")
            }
        }, {
            "ua": {
                '$regex': new RegExp(`${req.body.keywords}.*`, "gi")
            }
        }, {
            "mostSpecificSubdivision_nameCN": {
                '$regex': new RegExp(`${req.body.keywords}.*`, "gi")
            }
        }, {
            "code": req.body.keywords
        }, {
            "msg": {
                '$regex': new RegExp(`${req.body.keywords}.*`, "gi")
            }
        }]
    };
    resJson.TotalCount = await ResourceModel.find(tempCon).countDocuments();
    if (resJson.TotalCount) {
        resJson.List = await ResourceModel.find(tempCon).sort({ "createTime": -1 }).skip((req.body.pageIndex - 1) * req.body.pageSize).limit(req.body.pageSize);
    }
    return resJson;
};

exports.create = (data) => {
    var temp = new ResourceModel(data);
    temp.save(function(err, r) {
        if (err) {
            console.error(err);
        }
    });
};