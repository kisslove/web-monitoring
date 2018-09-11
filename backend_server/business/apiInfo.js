var Mongoose = require('mongoose');
var ApiModel = require('../models/apiModel');
var _ = require('lodash');
exports.list = async(req) => {
    let resJson = {
        List: [],
        TotalCount: 0
    };
    resJson.TotalCount = await ApiModel.find({}).countDocuments();
    if (resJson.TotalCount) {
        resJson.List = await ApiModel.find({}).sort({"createTime":-1}).skip((req.body.pageIndex - 1) * req.body.pageSize).limit(req.body.pageSize);
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


/**
 * API请求-list
 * @param {*} req 
 */
exports.apiStatis = async(req) => {
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

    let typeEnum = body.typeEnum;
    // name result
    let r = [];
    if (typeEnum == 0) { //成功率
        r = await ApiModel.aggregate([{
                "$match": {
                    "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                    "appKey": appKey
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
                    "appKey": appKey
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
                                timeDivider /*聚合时间段*/
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
                                timeDivider /*聚合时间段*/
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
    body.eTime = new Date(body.eTime);
    body.sTime = new Date(body.sTime);

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
    let r = await ApiModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "page": body.keywords
            }
        },
        {
            "$group": {
                "_id": 'api',
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