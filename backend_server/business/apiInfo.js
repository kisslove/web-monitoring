var Mongoose = require('mongoose');
var ApiModel = require('../models/apiModel');
var _ = require('lodash');
var util = require('../utils/util');

/**
 * API请求-list
 * @param {*} req 
 */
exports.list = async (req) => {
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
            "api": {
                '$regex': new RegExp(`${req.body.keywords}.*`, "gi")
            }
        }, {
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
            "code": isNaN(parseInt(req.body.keywords)) ? 0 : parseInt(req.body.keywords)
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
    temp.save(function (err, r) {
        if (err) {
            console.error(err);
        }
    });
};

exports.apiStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let typeEnum = body.typeEnum;
    // name result
    let r = {
        data: [],
        total: 0
    };
    if (typeEnum == 0) { //成功率
        r.data = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "api": { '$regex': new RegExp(`${body.keywords}.*`, "gi") }
            }
        },
        {
            "$group": {
                "_id": "$api",
                "list": { '$push': { 'success': '$success' } },
                "listSucc": { '$push': { 'success': true } },
            }
        },
        {
            "$project": {
                "_id": 0,
                'name': "$_id",
                'list': 1,
                "count": {
                    "$size": '$listSucc'
                }
            }
        },
        {
            "$sort": {
                'count': 1
            }
        },
        {
            "$skip": (body.pageIndex - 1) * body.pageSize
        },
        {
            "$limit": body.pageSize
        }
        ]);
        _.each(r.data, (d) => {
            // let temp = [];
            // temp = _.filter(d.list, function (e) {
            //     return e.success;
            // });
            d.result = d.count / d.list.length;
            delete d['list'];
        });

        let temp = await ApiModel.aggregate([{
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
        }
        ]);
        r.total = temp.length;
        r.data = _.sortBy(r.data, "result");
    }

    if (typeEnum == 1) { //msg聚类
        r.data = await ApiModel.aggregate([{
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
                'result': { "$size": '$list' },
                "count": {
                    "$size": '$list'
                }
            }
        },
        {
            "$sort": {
                'count': -1
            }
        },
        {
            "$skip": (body.pageIndex - 1) * body.pageSize
        },
        {
            "$limit": body.pageSize
        }
        ]);
        let temp1 = await ApiModel.aggregate([{
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
        }
        ]);
        r.total = temp1.length;
    }

    if (typeEnum == 2) { //成功耗时
        r.data = await ApiModel.aggregate([{
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
            "$sort": {
                'result': -1
            }
        },
        {
            "$skip": (body.pageIndex - 1) * body.pageSize
        },
        {
            "$limit": body.pageSize
        },
        {
            "$project": {
                "_id": 0,
                'name': "$_id",
                'result': 1
            }
        }
        ]);
        let temp2 = await ApiModel.aggregate([{
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
        }
        ]);
        r.total = temp2.length;
    }

    if (typeEnum == 3) { //失败耗时
        r.data = await ApiModel.aggregate([{
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
            "$sort": {
                'result': -1
            }
        },
        {
            "$skip": (body.pageIndex - 1) * body.pageSize
        },
        {
            "$limit": body.pageSize
        },
        {
            "$project": {
                "_id": 0,
                'name': "$_id",
                'result': 1
            }
        }
        ]);
        let temp3 = await ApiModel.aggregate([{
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
        }
        ]);
        r.total = temp3.length;
    }
    return r;
};


/**
 * API成功率同比和均值
 * @param {*} req 
 */
exports.apiSuccRateCompareAndAvg = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtimeAndTimeDivider(body);
    let matchCond = {
        "createTime": {
            '$gte': body.sTime,
            '$lt': body.eTime
        },
        "appKey": appKey
    };

    // 查询当前阶段
    let r1 = await ApiModel.find(_.assign({ success: true }, matchCond)).countDocuments();
    let r2 = await ApiModel.find(matchCond).countDocuments();
    let rate1 = isNaN(r1 / r2) ? 0 : (r1 / r2);

    let minusResult = body.eTime - body.sTime;
    let matchCond1 = {
        "createTime": {
            '$gte': new Date(body.sTime).setMilliseconds(new Date(body.sTime).getMilliseconds() - minusResult),
            '$lt': new Date(body.eTime).setMilliseconds(new Date(body.eTime).getMilliseconds() - minusResult)
        },
        "appKey": appKey
    };
    // 查询往前推
    let r11 = await ApiModel.find(_.assign({ success: true }, matchCond1)).countDocuments();
    let r21 = await ApiModel.find(matchCond1).countDocuments();
    let rate2 = isNaN(r11 / r21) ? 0 : (r11 / r21);
    return new Number(rate1 - rate2);
};





/**
 * API请求-APi成功率
 * @param {*} req 
 */
exports.apiSuccRate = async (req) => {
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
        temp = _.filter(d.apiList, function (e) {
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
exports.apiSuccRateStatic = async (req) => {
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
        temp = _.filter(d.apiList, function (e) {
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
exports.succRateGeo = async (req) => {
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
        temp = _.filter(d.apiList, function (e) {
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
exports.succTerminal = async (req) => {
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
        temp = _.filter(d.apiList, function (e) {
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
exports.msgCallDetails = async (req) => {
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
exports.msgGeo = async (req) => {
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
exports.msgTerminal = async (req) => {
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
exports.succOrFailTimes = async (req) => {
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
exports.elapsedTimeGeo = async (req) => {
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
exports.elapsedTimeTerminal = async (req) => {
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
exports.apiCase = async (req) => {
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
        let temp = _.filter(el.codeDetailsList, function (d) {
            return d.isSuccess;
        });
        el.successRate = temp.length / el.requestCount
    })
    return r;
};