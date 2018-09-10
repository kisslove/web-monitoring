var Mongoose = require('mongoose');
var PerfModel = require('../models/perfModel');
exports.list = async(req) => {
    let resJson = {
        List: [],
        TotalCount: 0
    };
    resJson.TotalCount = await PerfModel.find({}).count();
    if (resJson.TotalCount) {
        resJson.List = await PerfModel.find({}).skip((req.body.pageIndex - 1) * req.body.pageSize).limit(req.body.pageSize);
    }
    return resJson;
};

exports.create = (data) => {
    var temp = new PerfModel(data);
    temp.save(function(err, r) {
        if (err) {
            console.error(err);
        }
    });
};

/**
 * 访问速度-list
 * @param {*} req 
 */
exports.pageSpeedStatis = async(req) => {
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
    r = await PerfModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey
            }
        },
        {
            "$group": {
                "_id": "$page",
                "avgLoad": { '$avg': '$load' }
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
exports.keyPerf = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
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
    let matchCon = body.pageName ? {
        "$match": {
            "createTime": { '$gte': body.sTime, '$lt': body.eTime },
            "appKey": appKey,
            "page": body.pageName
        }
    } : {
        "$match": {
            "createTime": { '$gte': body.sTime, '$lt': body.eTime },
            "appKey": appKey
        }
    };
    let r = await PerfModel.aggregate([matchCon,
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
                "fpt": { '$avg': '$fpt' },
                "load": { '$avg': '$load' },
                "ready": { '$avg': '$ready' },
                "tti": { '$avg': '$tti' }
            }
        },
        {
            "$project": {
                "_id": 0,
                "fpt": 1,
                "load": 1,
                "ready": 1,
                "tti": 1,
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
 * 访问速度-区间段耗时
 * @param {*} req 
 */
exports.elapsedTime = async(req) => {
    let body = req.body;
    let appKey = new Mongoose.Types.ObjectId(body.appKey);
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
    let matchCon = body.pageName ? {
        "$match": {
            "createTime": { '$gte': body.sTime, '$lt': body.eTime },
            "appKey": appKey,
            "page": body.pageName
        }
    } : {
        "$match": {
            "createTime": { '$gte': body.sTime, '$lt': body.eTime },
            "appKey": appKey
        }
    };
    let r = await PerfModel.aggregate([matchCon,
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
                "dns": { '$avg': '$dns' },
                "dom": { '$avg': '$dom' },
                "res": { '$avg': '$res' },
                "ssl": { '$avg': '$ssl' },
                "tcp": { '$avg': '$tcp' },
                "trans": { '$avg': '$trans' },
                "ttfb": { '$avg': '$ttfb' }
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
 * 访问速度-地理分布
 * @param {*} req 
 */
exports.perfGeo = async(req) => {
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
    let r = await PerfModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "page": body.pageName
            }
        },
        {
            "$group": {
                "_id": "$mostSpecificSubdivision_nameCN",
                "fpt": { '$avg': '$fpt' },
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
exports.terminalSpeed = async(req) => {
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
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "page": body.pageName
            }
        },
        {
            "$group": {
                "_id": groupConTerminal,
                "speed": { '$avg': '$fpt' },
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