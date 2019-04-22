var Mongoose = require('mongoose');
var ApiModel = require('../models/apiModel');
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
    resJson.TotalCount = await ApiModel.find(tempCon).countDocuments();
    if (resJson.TotalCount) {
        resJson.List = await ApiModel.find(tempCon).sort({ "createTime": -1 }).skip((req.body.pageIndex - 1) * req.body.pageSize).limit(req.body.pageSize);
    }
    return resJson;
};

exports.create = (data) => {
    var temp = new ApiModel(data);
    temp.save(function(err, r) {
        if (err) {
            console.error(err);
        }
    });
};

exports.apiStatis = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let typeEnum = body.typeEnum;
    // name result
    let r = [];
    if (typeEnum == 0) { //成功率
        r = await ApiModel.aggregate([{
                "$match": {
                    "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                    "appKey": appKey,
                    "api": { '$regex': new RegExp(`${body.keywords}.*`, "gi") }
                }
            },
            {
                "$group": {
                    "_id": "$api",
                    "list": { '$push': { 'success': '$success' } }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    'name': "$_id",
                    'list': 1
                }
            }
        ]);
        _.each(r, (d) => {
            let temp = [];
            temp = _.filter(d.list, function(e) {
                return e.success;
            });
            d.result = temp.length / d.list.length;
            delete d['list'];
        });
        r = _.sortBy(r, "result");
    }

    if (typeEnum == 1) { //msg聚类
        r = await ApiModel.aggregate([{
                "$match": {
                    "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                    "appKey": appKey,
                    "msg": { '$regex': new RegExp(`${body.keywords}.*`, "gi") }
                }
            },
            {
                "$group": {
                    "_id": "$msg",
                    "list": { '$push': '$msg' }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    'name': "$_id",
                    'result': { "$size": '$list' }
                }
            }
        ]);
    }

    if (typeEnum == 2) { //成功耗时
        r = await ApiModel.aggregate([{
                "$match": {
                    "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                    "appKey": appKey,
                    "api": { '$regex': new RegExp(`${body.keywords}.*`, "gi") },
                    "success": true
                }
            },
            {
                "$group": {
                    "_id": "$api",
                    "result": { '$avg': '$time' }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    'name': "$_id",
                    'result': 1
                }
            }
        ]);
    }

    if (typeEnum == 3) { //失败耗时
        r = await ApiModel.aggregate([{
                "$match": {
                    "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                    "appKey": appKey,
                    "api": { '$regex': new RegExp(`${body.keywords}.*`, "gi") },
                    "success": false
                }
            },
            {
                "$group": {
                    "_id": "$api",
                    "result": { '$avg': '$time' }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    'name': "$_id",
                    'result': 1
                }
            }
        ]);
    }
    return r;
};

/**
 * API请求-APi成功率
 * @param {*} req 
 */
exports.apiSuccRate = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtimeAndTimeDivider(body);

    let r = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "api": body.apiName
            }
        },
        {
            "$group": {
                "_id": {
                    "$subtract": [
                        { "$subtract": ["$createTime", new Date(0)] },
                        {
                            "$mod": [
                                { "$subtract": ["$createTime", new Date(0)] },
                                body.timeDivider /*聚合时间段*/
                            ]
                        }
                    ]
                },
                "apiList": { '$push': { 'success': '$success' } }
            }
        },
        {
            "$project": {
                "_id": 0,
                'apiList': 1,
                'createTime': { '$add': [new Date(0), '$_id'] }
            }
        },
        {
            "$sort": {
                'createTime': 1
            }
        }
    ]);

    r.forEach(d => {
        let temp = [];
        temp = _.filter(d.apiList, function(e) {
            return e.success;
        });
        d.succCount = temp.length;
        d.times = d.apiList.length;
        d.succRate = d.succCount / d.times;
        delete d['apiList'];
    });

    return r;
};

/**
 * APi成功率(地理、终端)
 * @param {*} req 
 */
exports.apiSuccRateStatic = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtimeAndTimeDivider(body);

    let apiSuccRateType = body.apiSuccRateType;
    let matchCond;

    if (apiSuccRateType == 2) { //地理位置
        matchCond = {
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey,
                "mostSpecificSubdivision_nameCN": body.keywords
            }
        };
    }

    if (apiSuccRateType == 31) { //终端-bs
        matchCond = {
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey,
                "bs": body.keywords
            }
        };
    }
    if (apiSuccRateType == 32) { //终端-os
        matchCond = {
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey,
                "os": body.keywords
            }
        };
    }
    if (apiSuccRateType == 33) { //终端-pageWh
        matchCond = {
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey,
                "pageWh": body.keywords
            }
        };
    }

    let r = await ApiModel.aggregate([matchCond,
        {
            "$group": {
                "_id": {
                    "$subtract": [
                        { "$subtract": ["$createTime", new Date(0)] },
                        {
                            "$mod": [
                                { "$subtract": ["$createTime", new Date(0)] },
                                body.timeDivider /*聚合时间段*/
                            ]
                        }
                    ]
                },
                "apiList": { '$push': { 'success': '$success' } }
            }
        },
        {
            "$project": {
                "_id": 0,
                'apiList': 1,
                'createTime': { '$add': [new Date(0), '$_id'] }
            }
        },
        {
            "$sort": {
                'createTime': 1
            }
        }
    ]);

    r.forEach(d => {
        let temp = [];
        temp = _.filter(d.apiList, function(e) {
            return e.success;
        });
        d.succCount = temp.length;
        d.times = d.apiList.length;
        d.succRate = d.succCount / d.times;
        delete d['apiList'];
    });

    return r;
};

/**
 * API请求-APi成功率(地理分布)
 * @param {*} req 
 */
exports.succRateGeo = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);

    let r = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "api": body.apiName
            }
        },
        {
            "$group": {
                "_id": "$mostSpecificSubdivision_nameCN",
                "apiList": { '$push': { 'success': '$success' } }
            }
        },
        {
            "$project": {
                "_id": 0,
                'provice': '$_id',
                'apiList': 1,
            }
        },
        {
            "$sort": {
                'createTime': 1
            }
        }
    ]);

    r.forEach(d => {
        let temp = [];
        temp = _.filter(d.apiList, function(e) {
            return e.success;
        });
        d.succCount = temp.length;
        d.times = d.apiList.length;
        d.succRate = d.succCount / d.times;
        delete d['apiList'];
    });

    return r;
};

/**
 * API请求-APi成功率(终端分布)
 * @param {*} req 
 */
exports.succTerminal = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let terminal = body.terminal;
    let groupByCon;
    if (terminal == 0) {
        groupByCon = '$bs';
    }
    if (terminal == 1) {
        groupByCon = '$os';
    }
    if (terminal == 2) {
        groupByCon = '$pageWh';
    }
    let r = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "api": body.apiName
            }
        },
        {
            "$group": {
                "_id": groupByCon,
                "apiList": { '$push': { 'success': '$success' } }
            }
        },
        {
            "$project": {
                "_id": 0,
                'terminal': '$_id',
                'apiList': 1,
            }
        },
        {
            "$sort": {
                'createTime': 1
            }
        }
    ]);

    r.forEach(d => {
        let temp = [];
        temp = _.filter(d.apiList, function(e) {
            return e.success;
        });
        d.succRate = temp.length / d.apiList.length;
        delete d['apiList'];
    });

    return r;
};


/**
 * API请求-MSG聚类(msg调用详情)
 * @param {*} req 
 */
exports.msgCallDetails = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let r = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "msg": body.msg
            }
        },
        {
            "$group": {
                "_id": { "api": '$api', "code": "$code" },
                "list": { '$push': { 'success': '$success' } }
            }
        },
        {
            "$project": {
                "_id": 0,
                'groupName': '$_id',
                'list': 1,
            }
        },
        {
            "$sort": {
                'createTime': 1
            }
        }
    ]);

    r.forEach(d => {
        d.apiName = d.groupName.api;
        d.code = d.groupName.code;
        d.isSuccess = d.list[0].success;
        d.count = d.list.length;
        delete d['groupName'];
        delete d['list'];
    });

    return r;
};

/**
 * API请求-MSG聚类(地理分布)
 * @param {*} req 
 */
exports.msgGeo = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let r = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "msg": body.msg
            }
        },
        {
            "$group": {
                "_id": "$mostSpecificSubdivision_nameCN",
                "list": { '$push': { 'success': '$success' } }
            }
        },
        {
            "$project": {
                "_id": 0,
                'provice': '$_id',
                'list': 1,
            }
        },
        {
            "$sort": {
                'createTime': 1
            }
        }
    ]);

    r.forEach(d => {
        d.times = d.list.length;
        delete d['list'];
    });

    return r;
};

/**
 * API请求-MSG聚类(终端分布)
 * @param {*} req 
 */
exports.msgTerminal = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let terminal = body.terminal;
    let groupByCon;
    if (terminal == 0) {
        groupByCon = "$bs";
    }
    if (terminal == 1) {
        groupByCon = "$os";
    }
    if (terminal == 2) {
        groupByCon = "$pageWh";
    }
    let r = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "msg": body.msg
            }
        },
        {
            "$group": {
                "_id": groupByCon,
                "list": { '$push': { 'success': '$success' } }
            }
        },
        {
            "$project": {
                "_id": 0,
                'terminal': '$_id',
                'list': 1,
            }
        },
        {
            "$sort": {
                'createTime': 1
            }
        }
    ]);

    r.forEach(d => {
        d.times = d.list.length;
        delete d['list'];
    });

    return r;
};


/**
 * API请求-APi成功或失败耗时
 * @param {*} req 
 */
exports.succOrFailTimes = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtimeAndTimeDivider(body);
    let isSucc = body.isSucc;

    let r = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "api": body.apiName,
                'success': isSucc
            }
        },
        {
            "$group": {
                "_id": {
                    "$subtract": [
                        { "$subtract": ["$createTime", new Date(0)] },
                        {
                            "$mod": [
                                { "$subtract": ["$createTime", new Date(0)] },
                                body.timeDivider /*聚合时间段*/
                            ]
                        }
                    ]
                },
                "apiList": { '$push': { 'api': '$api' } },
                "avgTime": { "$avg": "$time" }
            }
        },
        {
            "$project": {
                "_id": 0,
                'avgTime': 1,
                'count': { "$size": '$apiList' },
                'createTime': { '$add': [new Date(0), '$_id'] }
            }
        },
        {
            "$sort": {
                'createTime': 1
            }
        }
    ]);
    return r;
};


/**
 * API请求-APi成功或失败耗时(地理分布)
 * @param {*} req 
 */
exports.elapsedTimeGeo = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let isSucc = body.isSucc;

    let r = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "api": body.apiName,
                'success': isSucc
            }
        },
        {
            "$group": {
                "_id": "$mostSpecificSubdivision_nameCN",
                "apiList": { '$push': { 'api': '$api' } },
                "avgTime": { "$avg": "$time" }
            }
        },
        {
            "$project": {
                "_id": 0,
                'avgTime': 1,
                'times': { "$size": '$apiList' },
                'provice': '$_id'
            }
        },
        {
            "$sort": {
                'times': -1
            }
        }
    ]);
    return r;
};

/**
 * API请求-APi成功或失败耗时(终端分布)
 * @param {*} req 
 */
exports.elapsedTimeTerminal = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let isSucc = body.isSucc;
    let terminal = body.terminal;
    let groupName;
    if (terminal == 0) {
        groupName = "$bs";
    }
    if (terminal == 1) {
        groupName = "$os";
    }
    if (terminal == 2) {
        groupName = "$pageWh";
    }
    let r = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "api": body.apiName,
                'success': isSucc
            }
        },
        {
            "$group": {
                "_id": groupName,
                "avgTime": { "$avg": "$time" }
            }
        },
        {
            "$project": {
                "_id": 0,
                'avgTime': 1,
                'terminal': '$_id'
            }
        },
        {
            "$sort": {
                'avgTime': -1
            }
        }
    ]);
    return r;
};


/**
 * 访问页面-APi详情
 * @param {*} req 
 */
exports.apiCase = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let r = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "page": body.keywords
            }
        },
        {
            "$group": {
                "_id": '$api',
                "avgTime": { "$avg": "$time" },
                "codeDetailsList": {
                    "$push": {
                        "code": '$code',
                        "createTime": "$createTime",
                        "isSuccess": "$success",
                        "time": "$time"
                    }
                }

            }
        },
        {
            "$project": {
                "_id": 0,
                'avgTime': 1,
                'apiName': '$_id',
                'codeDetailsList': 1,
                'requestCount': { "$size": "$codeDetailsList" }
            }
        },
        {
            "$sort": {
                'avgTime': -1
            }
        }
    ]);
    _.each(r, (el) => {
        let temp = _.filter(el.codeDetailsList, function(d) {
            return d.isSuccess;
        });
        el.successRate = temp.length / el.requestCount
    })
    return r;
};