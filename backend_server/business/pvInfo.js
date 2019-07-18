var _ = require('lodash');
var PvModel = require('../models/pvModel');
var Mongoose = require('mongoose');
var util = require('../utils/util');
//访问明细
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
    body = util.computeSTimeAndEtimeAndTimeDivider(body);
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
    body = util.computeSTimeAndEtime(body);
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
    body = util.computeSTimeAndEtime(body);
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
    body = util.computeSTimeAndEtime(body);
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
    body = util.computeSTimeAndEtime(body);
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
    body = util.computeSTimeAndEtime(body);
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
 * 访问页面-列表
 * @param {*} req 
 */
exports.pageRankStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let r = {
        pageStatis: [],
        totalCount: 0,
        total: 0
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
    },
    {
        "$skip": (body.pageIndex - 1) * body.pageSize
    },
    {
        "$limit": body.pageSize
    }
    ]);

    let temp = await PvModel.aggregate([{
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
    }
    ]);

    r.total = temp.length;

    let temp2 = await PvModel.find({
        "createTime": {
            '$gte': body.sTime,
            '$lt': body.eTime
        },
        "appKey": appKey,
        "page": {
            '$regex': new RegExp(`${body.keywords}.*`, "gi")
        }
    }).countDocuments();

    r.totalCount = temp2;
    return r;
};


/**
 * 访问页面-地理分布
 * @param {*} req 
 */
exports.addressMap = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);

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
    body = util.computeSTimeAndEtime(body);
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
 * ip-列表（按访问量）用户访问路径
 * @param {*} req 
 */
exports.userPathListStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
    let r = {
        data: [],
        total: 0
    };
    let matchCon = body.keywords ? {
        "$match": {
            "createTime": {
                '$gte': body.sTime,
                '$lt': body.eTime
            },
            "appKey": appKey,
            "onlineip": {
                '$regex': new RegExp(`${body.keywords}.*`, "gi")
            }
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
    let temp = await PvModel.aggregate([matchCon,
        {
            "$group": {
                "_id": '$onlineip'
            }
        }
    ]).read('sp').exec();

    r.total = temp.length;

    r.data = await PvModel.aggregate([matchCon,
        {
            "$group": {
                "_id": '$onlineip',
                "pathList": {
                    '$push': {
                        page: '$page',
                        createTime: '$createTime',
                        os: '$os',
                        bs: '$bs',
                        pageWh: '$pageWh',
                        city_nameCN: '$city_nameCN',
                        country_nameCN: '$country_nameCN',
                        mostSpecificSubdivision_nameCN: '$mostSpecificSubdivision_nameCN',
                        onlineip: '$onlineip',
                        isp: '$isp',
                        organizationCN: '$organizationCN'
                    }
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                'geo': "$_id",
                "pathList": 1,
                "count": {
                    "$size": '$pathList'
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
    ]).read('sp').exec();

    _.each(r.data, (el) => {
        if (el.pathList.length > 0) {
            el.os = el.pathList[0].os;
            el.bs = el.pathList[0].bs;
            el.pageWh = el.pathList[0].pageWh;
            el.city_nameCN = el.pathList[0].city_nameCN;
            el.country_nameCN = el.pathList[0].country_nameCN;
            el.mostSpecificSubdivision_nameCN = el.pathList[0].mostSpecificSubdivision_nameCN;
            el.onlineip = el.pathList[0].onlineip;
            el.isp = el.pathList[0].isp;
            el.organizationCN = el.pathList[0].organizationCN;
            el.pathList.forEach((item) => {
                delete item['os'];
                delete item['bs'];
                delete item['pageWh'];
                delete item['city_nameCN'];
                delete item['country_nameCN'];
                delete item['mostSpecificSubdivision_nameCN'];
                delete item['onlineip'];
                delete item['isp'];
                delete item['organizationCN'];
                item.createTimeShow = item.createTime;
                item.createTimeTemp = new Date(item.createTime).getTime().toString().substr(0, 10);
                item.createTime = new Date(item.createTime).getTime();
            });
            el.pathList = _.uniqBy(el.pathList, "createTimeTemp");
            el.count = el.pathList.length;
            el.pathList.sort(function (a, b) {
                if (a.createTime === b.createTime)
                    return 0;
                if (a.createTime - b.createTime > 0)
                    return 1;
                if (a.createTime - b.createTime < 0)
                    return -1;
            });
        }
    });

    // r.data.sort(function (a, b) {
    //     if (a.count === b.count)
    //         return 0;
    //     if (a.count - b.count < 0)
    //         return 1;
    //     if (a.count - b.count > 0)
    //         return -1;
    // });

    return r;
};


/**
 * 地理-列表（按访问量）
 * @param {*} req 
 */
exports.geoListStatis = async (req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body = util.computeSTimeAndEtime(body);
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
    body = util.computeSTimeAndEtime(body);
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