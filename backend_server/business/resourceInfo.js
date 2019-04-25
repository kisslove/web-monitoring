var Mongoose = require('mongoose');
var ResourceModel = require('../models/resourceModel');
var _ = require('lodash');
var util = require('../utils/util');

/**
 * resource-list
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

/**
 * 资源加载-列表
 * @param {*} req 
 */
exports.resourceListStatis = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let match = '';
    match = body.type ? {
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
    r = await ResourceModel.aggregate([{
            "$match": match
        },
        {
            "$group": {
                "_id": '$rUrl',
                "timeList": {
                    '$push': '$rDuration'
                },
                "list": {
                    '$push': { 'rEntryType': '$rEntryType', 'rInitiatorType': '$rInitiatorType', 'rSize': '$rSize' }
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'rUrl': "$_id",
                "rDuration": {
                    "$avg": '$timeList'
                },
                'list': 1
            }
        },
        {
            "$sort": {
                'rUrl': -1
            }
        }
    ]);
    let tempTotal = 0;
    _.each(r, (el) => {
        el.count = el.list.length;
        el.rDuration = parseInt(el.rDuration);
        Object.assign(el, el.list[0]);
        el.rSize = el.rSize ? parseFloat(el.rSize / 1024).toFixed(2) : 0;
        delete el['list'];
    });
    return r;
};