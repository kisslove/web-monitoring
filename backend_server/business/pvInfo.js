var _ = require('lodash');
var PvModel = require('../models/pvModel');
var Mongoose = require('mongoose');
//访问明细
exports.list = async(req) => {
    let resJson = {
        List: [],
        TotalCount: 0
    };
    resJson.TotalCount = await PvModel.find({}).countDocuments();
    if (resJson.TotalCount) {
        resJson.List = await PvModel.find({}).sort({"createTime":-1}).skip((req.body.pageIndex - 1) * req.body.pageSize).limit(req.body.pageSize);
    }
    return resJson;
};

//记录PV数据
exports.create = (data) => {
    var temp = new PvModel(data);
    temp.save(function(err, r) {
        if (err) {
            console.error(err);
        }
    });
};

/**
 * 应用总览-pv/uv
 * @param {*} req 
 */
exports.pvAndUvStatis = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    let resJson = {
        pvAndUvVmList: [],
        totalPv: 0,
        totalUv: 0
    };
    let timeDivider = 1000 * 60 * 60 * 24; /*聚合时间段,默认按天*/
    if (body.TimeQuantum == "") {
        let temp = new Date(body.eTime) - new Date(body.sTime);
        if (temp <= 1000 * 60 * 30) {
            body.TimeQuantum = 0;
        } else if (temp <= 1000 * 60 * 60) {
            body.TimeQuantum = 1;
        } else if (temp <= 1000 * 60 * 60 * 4) {
            body.TimeQuantum = 2;
        } else if (temp <= 1000 * 60 * 60 * 12) {
            body.TimeQuantum = 3;
        } else if (temp <= 1000 * 60 * 60 * 24) {
            body.TimeQuantum = 4;
        } else if (temp <= 1000 * 60 * 60 * 24 * 3) {
            body.TimeQuantum = 5;
        } else if (temp <= 1000 * 60 * 60 * 24 * 7) {
            body.TimeQuantum = 6;
        } else {
            timeDivider = 1000 * 60 * 60 * 24;
        }
    }

    switch (body.TimeQuantum) {
        case 0: //最近30分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 30));
            timeDivider = 1000 * 60 * 5;
            break;
        case 1: //最近60分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60));
            timeDivider = 1000 * 60 * 10;
            break;
        case 2: //最近4小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 4));
            timeDivider = 1000 * 60 * 30;
            break;
        case 3: //最近12小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 12));
            timeDivider = 1000 * 60 * 60;
            break;
        case 4: //最近24小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 24));
            timeDivider = 1000 * 60 * 60;
            break;
        case 5: //最近3天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 3));
            timeDivider = 1000 * 60 * 60 * 12;
            break;
        case 6: //最近7天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 7));
            timeDivider = 1000 * 60 * 60 * 12;
            break;
        default:
            break;
    };
    let matchCon = body.keywords ? {
        "$match": {
            "createTime": { '$gte': body.sTime, '$lt': body.eTime },
            "appKey": appKey,
            "page": body.keywords
        }
    } : {
        "$match": {
            "createTime": { '$gte': body.sTime, '$lt': body.eTime },
            "appKey": appKey
        }
    };
    let r = await PvModel.aggregate([matchCon,
        {
            "$group": {
                "_id": {
                    "$subtract": [
                        { "$subtract": ["$createTime", new Date(0)] },
                        {
                            "$mod": [
                                { "$subtract": ["$createTime", new Date(0)] },
                                timeDivider /*聚合时间段*/
                            ]
                        }
                    ]
                },
                "pageList": { '$push': '$page' },
                "ipList": { '$push': '$onlineip' }
            }
        },
        {
            "$project": {
                "_id": 0,
                'ipList': 1,
                "pv": { "$size": '$pageList' },
                'createTime': { '$add': [new Date(0), '$_id'] }
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
                "pvList": { '$push': '$page' },
                "uvList": { '$push': '$onlineip' }
            }
        }, {
            '$project': {
                "_id": 0,
                'uvList': 1,
                "pv": { "$size": '$pvList' },
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
exports.pageTopStatis = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    // count,page
    body.eTime = new Date(body.eTime);
    body.sTime = new Date(body.sTime);
    switch (body.TimeQuantum) {
        case 0: //最近30分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 30));
            break;
        case 1: //最近60分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60));
            break;
        case 2: //最近4小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 4));
            break;
        case 3: //最近12小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 12));
            break;
        case 4: //最近24小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 24));
            break;
        case 5: //最近3天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 3));
            break;
        case 6: //最近7天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 7));
            break;
        default:
            break;
    };
    let r = [];
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$page",
                "pageList": { '$push': '$page' },
            }
        },
        {
            "$project": {
                "_id": 0,
                'page': "$_id",
                "count": { "$size": '$pageList' }
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
exports.geoStatis = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body.eTime = new Date(body.eTime);
    body.sTime = new Date(body.sTime);
    switch (body.TimeQuantum) {
        case 0: //最近30分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 30));
            break;
        case 1: //最近60分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60));
            break;
        case 2: //最近4小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 4));
            break;
        case 3: //最近12小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 12));
            break;
        case 4: //最近24小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 24));
            break;
        case 5: //最近3天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 3));
            break;
        case 6: //最近7天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 7));
            break;
        default:
            break;
    };
    let r = [];
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$mostSpecificSubdivision_nameCN",
                "pageList": { '$push': '$page' },
                "ipList": { '$push': '$onlineip' },
            }
        },
        {
            "$project": {
                "_id": 0,
                'provice': "$_id",
                "pv": { "$size": '$pageList' },
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
exports.browserStatis = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body.eTime = new Date(body.eTime);
    body.sTime = new Date(body.sTime);
    switch (body.TimeQuantum) {
        case 0: //最近30分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 30));
            break;
        case 1: //最近60分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60));
            break;
        case 2: //最近4小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 4));
            break;
        case 3: //最近12小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 12));
            break;
        case 4: //最近24小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 24));
            break;
        case 5: //最近3天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 3));
            break;
        case 6: //最近7天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 7));
            break;
        default:
            break;
    };
    let r = [];
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$bs",
                "pageList": { '$push': '$page' }
            }
        },
        {
            "$project": {
                "_id": 0,
                'bs': "$_id",
                "count": { "$size": '$pageList' },
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
exports.osStatis = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body.eTime = new Date(body.eTime);
    body.sTime = new Date(body.sTime);
    switch (body.TimeQuantum) {
        case 0: //最近30分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 30));
            break;
        case 1: //最近60分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60));
            break;
        case 2: //最近4小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 4));
            break;
        case 3: //最近12小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 12));
            break;
        case 4: //最近24小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 24));
            break;
        case 5: //最近3天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 3));
            break;
        case 6: //最近7天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 7));
            break;
        default:
            break;
    };
    let r = [];
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$os",
                "pageList": { '$push': '$page' }
            }
        },
        {
            "$project": {
                "_id": 0,
                'os': "$_id",
                "count": { "$size": '$pageList' },
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
exports.pageWhStatis = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body.eTime = new Date(body.eTime);
    body.sTime = new Date(body.sTime);
    switch (body.TimeQuantum) {
        case 0: //最近30分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 30));
            break;
        case 1: //最近60分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60));
            break;
        case 2: //最近4小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 4));
            break;
        case 3: //最近12小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 12));
            break;
        case 4: //最近24小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 24));
            break;
        case 5: //最近3天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 3));
            break;
        case 6: //最近7天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 7));
            break;
        default:
            break;
    };
    let r = [];
    r = await PvModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$pageWh",
                "pageList": { '$push': '$page' }
            }
        },
        {
            "$project": {
                "_id": 0,
                'pageWh': "$_id",
                "count": { "$size": '$pageList' }
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
exports.pageRankStatis = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body.eTime = new Date(body.eTime);
    body.sTime = new Date(body.sTime);
    switch (body.TimeQuantum) {
        case 0: //最近30分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 30));
            break;
        case 1: //最近60分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60));
            break;
        case 2: //最近4小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 4));
            break;
        case 3: //最近12小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 12));
            break;
        case 4: //最近24小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 24));
            break;
        case 5: //最近3天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 3));
            break;
        case 6: //最近7天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 7));
            break;
        default:
            break;
    };
    let r = {
        pageStatis: [],
        totalCount: 0
    };
    r.pageStatis = await PvModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$page",
                "pageList": { '$push': '$page' }
            }
        },
        {
            "$project": {
                "_id": 0,
                'page': "$_id",
                "count": { "$size": '$pageList' }
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
exports.addressMap = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body.eTime = new Date(body.eTime);
    body.sTime = new Date(body.sTime);
    switch (body.TimeQuantum) {
        case 0: //最近30分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 30));
            break;
        case 1: //最近60分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60));
            break;
        case 2: //最近4小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 4));
            break;
        case 3: //最近12小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 12));
            break;
        case 4: //最近24小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 24));
            break;
        case 5: //最近3天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 3));
            break;
        case 6: //最近7天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 7));
            break;
        default:
            break;
    };

    r = await PvModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                'page': body.keywords
            }
        },
        {
            "$group": {
                "_id": "$mostSpecificSubdivision_nameCN",
                "pageList": { '$push': '$page' }
            }
        },
        {
            "$project": {
                "_id": 0,
                'provice': "$_id",
                "pv": { "$size": '$pageList' }
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
exports.terminalStatis = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
    body.eTime = new Date(body.eTime);
    body.sTime = new Date(body.sTime);
    switch (body.TimeQuantum) {
        case 0: //最近30分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 30));
            break;
        case 1: //最近60分钟
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60));
            break;
        case 2: //最近4小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 4));
            break;
        case 3: //最近12小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 12));
            break;
        case 4: //最近24小时
            body.eTime = new Date();
            body.sTime = new Date(new Date().setMinutes(new Date().getMinutes() - 60 * 24));
            break;
        case 5: //最近3天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 3));
            break;
        case 6: //最近7天
            body.eTime = new Date();
            body.sTime = new Date(new Date().setDate(new Date().getDate() - 7));
            break;
        default:
            break;
    };
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
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                'page': body.pageName
            }
        },
        {
            "$group": {
                "_id": groupName,
                "pageList": { '$push': '$page' }
            }
        },
        {
            "$project": {
                "_id": 0,
                'terminal': "$_id",
                "pvCount": { "$size": '$pageList' }
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