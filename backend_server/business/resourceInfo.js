var Mongoose = require('mongoose');
var ResourceModel = require('../models/resourceModel');
var _ = require('lodash');
var util = require('../utils/util');

/**
 * 资源加载-列表
 * @param {*} req 
 */
exports.list = async(req) => {
    let appKey = new Mongoose.Types.ObjectId(req.body.appKey);
    let body = util.computeSTimeAndEtime(req.body);
    let resJson = {
        List: [],
        TotalCount: 0
    };
    let tempCon = '';
    tempCon = body.type ? {
        "createTime": {
            '$gte': body.sTime,
            '$lt': body.eTime
        },
        "appKey": appKey,
        "rUrl": {
            '$regex': new RegExp(`${body.keywords}.*`, "gi")
        },
        "rInitiatorType": body.type
    } : {
        "createTime": {
            '$gte': body.sTime,
            '$lt': body.eTime
        },
        "appKey": appKey,
        "rUrl": {
            '$regex': new RegExp(`${body.keywords}.*`, "gi")
        }
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