var Mongoose = require('mongoose');
var PerfModel = require('../models/perfModel');
var util=require('../utils/util');
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
        }]
    };
    resJson.TotalCount = await PerfModel.find(tempCon).countDocuments();
    if (resJson.TotalCount) {
        resJson.List = await PerfModel.find(tempCon).sort({
            "createTime": -1
        }).skip((req.body.pageIndex - 1) * req.body.pageSize).limit(req.body.pageSize);
    }
    return resJson;
};

exports.create = (data) => {
    var temp = new PerfModel(data);
    temp.save(function (err, r) {
        if (err) {
            console.error(err);
        }
    });
};

/**
 * 访问速度-list
 * @param {*} req 
 */
exports.pageSpeedStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);
    let r = [];
    r = await PerfModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey,
                "page": {'$regex':new RegExp(`${body.keywords}.*`,"gi")}
            }
        },
        {
            "$group": {
                "_id": "$page",
                "avgLoad": {
                    '$avg': '$load'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'page': "$_id",
                'avgLoad': 1
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

/**
 * 访问速度-关键性能指标
 * @param {*} req 
 */
exports.keyPerf = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtimeAndTimeDivider(body);
    let matchCon = body.pageName ? {
        "$match": {
            "createTime": {
                '$gte': body.sTime,
                '$lt': body.eTime
            },
            "appKey": appKey,
            "page": body.pageName
        }
    } : {
        "$match": {
            "createTime": {
                '$gte': body.sTime,
                '$lt': body.eTime
            },
            "appKey": appKey
        }
    };
    let r = await PerfModel.aggregate([matchCon,
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
                "fpt": {
                    '$avg': '$fpt'
                },
                "load": {
                    '$avg': '$load'
                },
                "ready": {
                    '$avg': '$ready'
                },
                "tti": {
                    '$avg': '$tti'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "fpt": 1,
                "load": 1,
                "ready": 1,
                "tti": 1,
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
    return r;
};

/**
 * 访问速度同比和均值
 * @param {*} req 
 */
exports.perfSpeedCompareAndAvg = async (req) => {
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

    // 查询当前阶段加载速度平均值
    let r1 = await PerfModel.find(matchCond);
    let r1Avg=r1.reduce((acc, val) => acc + val.load, 0)/r1.length;
    let minusResult = body.eTime - body.sTime;
    let matchCond1 = {
        "createTime": {
            '$gte': new Date(body.sTime).setMilliseconds(new Date(body.sTime).getMilliseconds() - minusResult),
            '$lt': new Date(body.eTime).setMilliseconds(new Date(body.eTime).getMilliseconds() - minusResult)
        },
        "appKey": appKey
    };
    // 查询往前推的加载速度平均值
    let r11 = await PerfModel.find(matchCond1);
    let r11Avg=r11.reduce((acc, val) => acc + val.load, 0)/r11.length;
    return new Number((isNaN(r1Avg)?0:r1Avg)-(isNaN(r11Avg)?0:r11Avg));
};

/**
 * 访问速度-区间段耗时
 * @param {*} req 
 */
exports.elapsedTime = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtimeAndTimeDivider(body);
    let matchCon = body.pageName ? {
        "$match": {
            "createTime": {
                '$gte': body.sTime,
                '$lt': body.eTime
            },
            "appKey": appKey,
            "page": body.pageName
        }
    } : {
        "$match": {
            "createTime": {
                '$gte': body.sTime,
                '$lt': body.eTime
            },
            "appKey": appKey
        }
    };
    let r = await PerfModel.aggregate([matchCon,
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
                "dns": {
                    '$avg': '$dns'
                },
                "dom": {
                    '$avg': '$dom'
                },
                "res": {
                    '$avg': '$res'
                },
                "ssl": {
                    '$avg': '$ssl'
                },
                "tcp": {
                    '$avg': '$tcp'
                },
                "trans": {
                    '$avg': '$trans'
                },
                "ttfb": {
                    '$avg': '$ttfb'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "dns": 1,
                "dom": 1,
                "res": 1,
                "ssl": 1,
                "tcp": 1,
                "trans": 1,
                "ttfb": 1,
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
    return r;
};

/**
 * 访问速度-地理分布
 * @param {*} req 
 */
exports.perfGeo = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);
    let r = await PerfModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey,
                "page": body.pageName
            }
        },
        {
            "$group": {
                "_id": "$mostSpecificSubdivision_nameCN",
                "fpt": {
                    '$avg': '$fpt'
                },
            }
        },
        {
            "$project": {
                "_id": 0,
                "fpt": '$fpt',
                'provice': '$_id'
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
 * 访问速度-访问终端
 * @param {*} req 
 */
exports.terminalSpeed = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);
    let terminal = body.terminal;
    if (terminal == 0) {
        groupConTerminal = "$bs";
    }
    if (terminal == 1) {
        groupConTerminal = "$os";
    }
    if (terminal == 2) {
        groupConTerminal = "$pageWh";
    }

    let r = await PerfModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey,
                "page": body.pageName
            }
        },
        {
            "$group": {
                "_id": groupConTerminal,
                "speed": {
                    '$avg': '$fpt'
                },
            }
        },
        {
            "$project": {
                "_id": 0,
                "speed": 1,
                'terminal': '$_id'
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
 * 访问速度-关键性能指标(地理/终端)
 * @param {*} req 
 */
exports.visitSpeedStatic = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtimeAndTimeDivider(body);

    let kerfType = body.kerfType;
    let matchCond;

    if (kerfType == 2) { //地理位置
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

    if (kerfType == 31) { //终端-bs
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
    if (kerfType == 32) { //终端-os
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
    if (kerfType == 33) { //终端-pageWh
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

    let r = await PerfModel.aggregate([matchCond,
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
                "fpt": {
                    '$avg': '$fpt'
                },
                "tti": {
                    '$avg': '$tti'
                },
                "ready": {
                    '$avg': '$ready'
                },
                "load": {
                    '$avg': '$load'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "fpt": 1,
                "tti": 1,
                "ready": 1,
                "load": 1,
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
    return r;
};
