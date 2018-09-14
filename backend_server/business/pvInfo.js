var _ = require('lodash');
var PvModel = require('../models/pvModel');
var Mongoose = require('mongoose');
var util=require('../utils/util');
//访问明细
exports.list = async (req) => {
    let appKey = new Mongoose.Types.ObjectId(req.body.appKey);
    let resJson = {
        List: [],
        TotalCount: 0
    };
    let tempCon = {
        "appKey":appKey,
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
    resJson.TotalCount = await PvModel.find(tempCon).countDocuments();
    if (resJson.TotalCount) {
        resJson.List = await PvModel.find(tempCon).sort({
            "createTime": -1
        }).skip((req.body.pageIndex - 1) * req.body.pageSize).limit(req.body.pageSize);
    }
    return resJson;
};

//记录PV数据
exports.create = (data) => {
    var temp = new PvModel(data);
    temp.save(function (err, r) {
        if (err) {
            console.error(err);
        }
    });
};

/**
 * 应用总览-pv/uv
 * @param {*} req 
 */
exports.pvAndUvStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    let resJson = {
        pvAndUvVmList: [],
        totalPv: 0,
        totalUv: 0
    };
    body=util.computeSTimeAndEtimeAndTimeDivider(body);
    let matchCon = body.keywords ? {
        "$match": {
            "createTime": {
                '$gte': body.sTime,
                '$lt': body.eTime
            },
            "appKey": appKey,
            "page": body.keywords
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
    let r = await PvModel.aggregate([matchCon,
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
                "pageList": {
                    '$push': '$page'
                },
                "ipList": {
                    '$push': '$onlineip'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'ipList': 1,
                "pv": {
                    "$size": '$pageList'
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

    r.forEach(element => {
        element.uv = _.uniq(element.ipList).length;
        delete element['ipList'];
    });
    resJson.pvAndUvVmList = r;

    //查询总共uv/pv
    let r1 = await PvModel.aggregate([matchCon,
        {
            "$group": {
                "_id": null,
                "pvList": {
                    '$push': '$page'
                },
                "uvList": {
                    '$push': '$onlineip'
                }
            }
        }, {
            '$project': {
                "_id": 0,
                'uvList': 1,
                "pv": {
                    "$size": '$pvList'
                },
            }
        }
    ]);
    r1.forEach(element => {
        resJson.totalPv = element.pv;
        resJson.totalUv = _.uniq(element.uvList).length;
    });

    return resJson;
};

/**
 *  应用总览-访问Top
 * @param {*} req 
 */
exports.pageTopStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    // count,page
    body=util.computeSTimeAndEtime(body);
    let r = [];
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$page",
                "pageList": {
                    '$push': '$page'
                },
            }
        },
        {
            "$project": {
                "_id": 0,
                'page': "$_id",
                "count": {
                    "$size": '$pageList'
                }
            }
        },
        {
            "$sort": {
                'count': -1
            }
        }
    ]).limit(body.top || 8);
    return r;
};

/**
 * 应用总览-地理位置
 * @param {*} req 
 */
exports.geoStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);
    let r = [];
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$mostSpecificSubdivision_nameCN",
                "pageList": {
                    '$push': '$page'
                },
                "ipList": {
                    '$push': '$onlineip'
                },
            }
        },
        {
            "$project": {
                "_id": 0,
                'provice': "$_id",
                "pv": {
                    "$size": '$pageList'
                },
                "ipList": 1
            }
        },
        {
            "$sort": {
                'count': -1
            }
        }
    ]);
    r.forEach(element => {
        element.pv = element.pv;
        element.uv = _.uniq(element.ipList).length;
        delete element['ipList'];
    });
    return r;
};

/**
 * 应用总览-浏览器pv占比
 * @param {*} req 
 */
exports.browserStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);
    let r = [];
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$bs",
                "pageList": {
                    '$push': '$page'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'bs': "$_id",
                "count": {
                    "$size": '$pageList'
                },
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
 * 应用总览-浏览器os占比
 * @param {*} req 
 */
exports.osStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);
    let r = [];
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$os",
                "pageList": {
                    '$push': '$page'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'os': "$_id",
                "count": {
                    "$size": '$pageList'
                },
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
 * 应用总览-浏览器分辨率占比
 * @param {*} req 
 */
exports.pageWhStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);
    let r = [];
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$pageWh",
                "pageList": {
                    '$push': '$page'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'pageWh': "$_id",
                "count": {
                    "$size": '$pageList'
                }
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
 * 应用总览-浏览器分辨率占比
 * @param {*} req 
 */
exports.pageRankStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);
    let r = {
        pageStatis: [],
        totalCount: 0
    };
    r.pageStatis = await PvModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey,
                "page": {
                    '$regex': new RegExp(`${body.keywords}.*`, "gi")
                }
            }
        },
        {
            "$group": {
                "_id": "$page",
                "pageList": {
                    '$push': '$page'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'page': "$_id",
                "count": {
                    "$size": '$pageList'
                }
            }
        },
        {
            "$sort": {
                'count': -1
            }
        }
    ]);

    _.forEach(r.pageStatis, (d) => {
        r.totalCount = r.totalCount + d.count;
    });
    return r;
};


/**
 * 访问页面-地理分布
 * @param {*} req 
 */
exports.addressMap = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);

    r = await PvModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey,
                'page': body.keywords
            }
        },
        {
            "$group": {
                "_id": "$mostSpecificSubdivision_nameCN",
                "pageList": {
                    '$push': '$page'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'provice': "$_id",
                "pv": {
                    "$size": '$pageList'
                }
            }
        },
        {
            "$sort": {
                'pv': -1
            }
        }
    ]);

    return r;
};

/**
 * 访问页面-终端分布
 * @param {*} req 
 */
exports.terminalStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);
    let terminal = body.terminal;
    let groupName;
    if (terminal == 0) {
        groupName = '$bs';
    }
    if (terminal == 1) {
        groupName = '$os';
    }
    if (terminal == 2) {
        groupName = '$pageWh';
    }
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey,
                'page': body.pageName
            }
        },
        {
            "$group": {
                "_id": groupName,
                "pageList": {
                    '$push': '$page'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'terminal': "$_id",
                "pvCount": {
                    "$size": '$pageList'
                }
            }
        },
        {
            "$sort": {
                'pvCount': -1
            }
        }
    ]);

    return r;
};


/**
 * 地理-列表（按访问量）
 * @param {*} req 
 */
exports.geoListStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": '$mostSpecificSubdivision_nameCN',
                "pageList": {
                    '$push': '$page'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'geo': "$_id",
                "count": {
                    "$size": '$pageList'
                }
            }
        },
        {
            "$sort": {
                'count': -1
            }
        }
    ]);
    let tempTotal = 0;
    _.each(r, (el) => {
        tempTotal += el.count;
    });
    _.each(r, (el) => {
        el.percent = new Number(el.count / tempTotal * 100).toFixed(2);
    });

    return r;
};

/**
 * 终端-列表（按访问量）
 * @param {*} req 
 */
exports.terminalListStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body=util.computeSTimeAndEtime(body);
    let ternimalType = body.ternimalType;
    let groupName;
    if (ternimalType == 0) {
        groupName = "$bs";
    }
    if (ternimalType == 1) {
        groupName = "$os";
    }
    if (ternimalType == 2) {
        groupName = "$pageWh";
    }
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": {
                    '$gte': body.sTime,
                    '$lt': body.eTime
                },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": groupName,
                "pageList": {
                    '$push': '$page'
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'terminal': "$_id",
                "count": {
                    "$size": '$pageList'
                }
            }
        },
        {
            "$sort": {
                'count': -1
            }
        }
    ]);
    let tempTotal = 0;
    _.each(r, (el) => {
        tempTotal += el.count;
    });
    _.each(r, (el) => {
        el.percent = new Number(el.count / tempTotal * 100).toFixed(2);
    });

    return r;
};