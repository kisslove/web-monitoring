var Mongoose = require('mongoose');
var JsModel = require('../models/jsModel');
var PvModel = require('../models/pvModel');
var ApiModel = require('../models/apiModel');
var ConsoleModel = require('../models/consoleModel');
var util = require('../utils/util');
var _ = require('lodash');

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
            "error": {
                '$regex': new RegExp(`${req.body.keywords}.*`, "gi")
            }
        }]
    };
    resJson.TotalCount = await JsModel.find(tempCon).countDocuments();
    if (resJson.TotalCount) {
        resJson.List = await JsModel.find(tempCon).sort({
            "createTime": -1
        }).skip((req.body.pageIndex - 1) * req.body.pageSize).limit(req.body.pageSize);
    }
    return resJson;
};

/**
 * js错误追踪用户行为路径
 * @param {*} req 
 */
exports.jsErrorTrackPath = async (req) => {
    let appKey = new Mongoose.Types.ObjectId(req.body.appKey);
    let resJson = {
        List: []
    };
    let temp = new Date(req.body.createTime);
    let tempCon = {
        "createTime": {
            '$gte': new Date(new Date().setMinutes(temp.getMinutes() - 2)),
            '$lte': temp
        },
        "appKey": appKey,
        "onlineip": req.body.onlineip,
        "os": req.body.os,
        "pageWh": req.body.pageWh,
        "ua": req.body.ua,
        "bs": req.body.bs
    };
    let result_pv = await PvModel.find(tempCon);
    let result_api = await ApiModel.find(tempCon);
    let result_console = await ConsoleModel.find(tempCon);
    let list = result_pv.concat(result_api).concat(result_console);
    if (list.length > 0) {
        resJson.List = _.sortBy(_.uniqBy(list, "createTime"), "createTime");
    }
    return resJson;
};


exports.create = (data) => {
    var temp = new JsModel(data);
    temp.save(function (err, r) {
        if (err) {
            console.error(err);
        }
    });
};


/**
 * js错误率同比和均值
 * @param {*} req 
 */
exports.jsErrorRateCompareAndAvg = async (req) => {
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

    // 查询当前阶段错误率
    let r1 = await JsModel.find(matchCond).countDocuments();
    let r2 = await PvModel.find(matchCond).countDocuments();
    let rate1 = isNaN(r1 / r2) ? 0 : (r1 / r2);

    let minusResult = body.eTime - body.sTime;
    let matchCond1 = {
        "createTime": {
            '$gte': new Date(body.sTime).setMilliseconds(new Date(body.sTime).getMilliseconds() - minusResult),
            '$lt': new Date(body.eTime).setMilliseconds(new Date(body.eTime).getMilliseconds() - minusResult)
        },
        "appKey": appKey
    };
    // 查询往前推的错误率
    let r11 = await JsModel.find(matchCond1).countDocuments();
    let r21 = await PvModel.find(matchCond1).countDocuments();
    let rate2 = isNaN(r11 / r21) ? 0 : (r11 / r21);
    return new Number(rate1-rate2);
};


/**
 * js错误率
 * @param {*} req 
 */
exports.jsErrorRate = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtimeAndTimeDivider(body);

    let errorRateType = body.errorRateType;
    let matchCond;
    if (errorRateType == 1) { //访问页面
        matchCond = {
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey,
                "page": body.keywords
            }
        };
    }

    if (errorRateType == 2) { //地理位置
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

    if (errorRateType == 31) { //终端-bs
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
    if (errorRateType == 32) { //终端-os
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
    if (errorRateType == 33) { //终端-pageWh
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

    let r1 = await JsModel.aggregate([matchCond,
        {
            "$group": {
                "_id": {
                    "$subtract": [{
                        "$subtract": ["$createTime", new Date(0)]
                    },
                    {
                        "$mod": [{
                            "$subtract": ["$createTime", new Date(0)]
                        },
                        body.timeDivider /*聚合时间段*/
                        ]
                    }
                    ]
                },
                "list": {
                    '$push': {
                        'success': '$page'
                    }
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'count': {
                    '$size': '$list'
                },
                'createTime': {
                    '$add': [new Date(0), '$_id']
                }
            }
        },
        {
            "$sort": {
                'createTime': 1
            }
        }
    ]);

    let r2 = await PvModel.aggregate([matchCond,
        {
            "$group": {
                "_id": {
                    "$subtract": [{
                        "$subtract": ["$createTime", new Date(0)]
                    },
                    {
                        "$mod": [{
                            "$subtract": ["$createTime", new Date(0)]
                        },
                        body.timeDivider /*聚合时间段*/
                        ]
                    }
                    ]
                },
                "list": {
                    '$push': {
                        'success': '$page'
                    }
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'totalCount': {
                    '$size': '$list'
                },
                'createTime': {
                    '$add': [new Date(0), '$_id']
                }
            }
        },
        {
            "$sort": {
                'createTime': 1
            }
        }
    ]);

    let r = {
        errorStatis: []
    };
    _.each(r1, (d, key) => {
        let temp = _.filter(r2, function (el) {
            return el.createTime.toString() == d.createTime.toString();
        });

        r.errorStatis.push({
            'createTime': d.createTime,
            'errorCount': d.count,
            'errorRate': d.count / (temp[0] ? temp[0].totalCount : 1),
            'pv': temp[0] ? temp[0].totalCount : 1
        });
    })
    return r;
};

/**
 * 访问页面-js聚类
 * @param {*} req 
 */
exports.jsAggregate = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);

    let r = await JsModel.aggregate([{
        "$match": {
            "createTime": {
                '$gte': body.sTime,
                '$lt': body.eTime
            },
            "appKey": appKey,
            "page": body.keywords
        }
    },
    {
        "$group": {
            "_id": '$error',
            "list": {
                '$push': "$page"
            }
        }
    },
    {
        "$project": {
            "_id": 0,
            'count': {
                '$size': '$list'
            },
            'msg': '$_id'
        }
    },
    {
        "$sort": {
            'count': -1
        }
    }
    ]);

    return r;
};