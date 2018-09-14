var Mongoose = require('mongoose');
var JsModel = require('../models/jsModel');
var PvModel = require('../models/pvModel');
var util=require('../utils/util');
var _ = require('lodash');
exports.list = async (req) => {
    let resJson = {
        List: [],
        TotalCount: 0
    };
    let tempCon = {
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

exports.create = (data) => {
    var temp = new JsModel(data);
    temp.save(function (err, r) {
        if (err) {
            console.error(err);
        }
    });
};


/**
 * js错误率
 * @param {*} req 
 */
exports.jsErrorRate = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtimeAndTimeDivider(body);

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
    body=util.computeSTimeAndEtime(body);

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