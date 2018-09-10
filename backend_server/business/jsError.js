var Mongoose = require('mongoose');
var JsModel = require('../models/jsModel');
var PvModel = require('../models/pvModel');
var _ = require('lodash');
exports.list = async(req) => {
    let resJson = {
        List: [],
        TotalCount: 0
    };
    resJson.TotalCount = await JsModel.find({}).count();
    if (resJson.TotalCount) {
        resJson.List = await JsModel.find({}).skip((req.body.pageIndex - 1) * req.body.pageSize).limit(req.body.pageSize);
    }
    return resJson;
};

exports.create = (data) => {
    var temp = new JsModel(data);
    temp.save(function(err, r) {
        if (err) {
            console.error(err);
        }
    });
};


/**
 * 访问页面-js错误率
 * @param {*} req 
 */
exports.jsErrorRate = async(req) => {
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

    let r1 = await JsModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "page": body.keywords
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
                "list": { '$push': { 'success': '$page' } }
            }
        },
        {
            "$project": {
                "_id": 0,
                'count': { '$size': '$list' },
                'createTime': { '$add': [new Date(0), '$_id'] }
            }
        },
        {
            "$sort": {
                'createTime': 1
            }
        }
    ]);

    let r2 = await PvModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "page": body.keywords
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
                "list": { '$push': { 'success': '$page' } }
            }
        },
        {
            "$project": {
                "_id": 0,
                'totalCount': { '$size': '$list' },
                'createTime': { '$add': [new Date(0), '$_id'] }
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
        let temp = _.filter(r2, function(el) {
            return el.createTime.toString() == d.createTime.toString();
        });

        r.errorStatis.push({
            'createTime': d.createTime,
            'errorCount': d.count,
            'errorRate': d.count / temp[0].totalCount,
            'pv': temp[0].totalCount
        });
    })
    return r;
};



/**
 * 访问页面-js聚类
 * @param {*} req 
 */
exports.jsAggregate = async(req) => {
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

    let r = await JsModel.aggregate([{
            "$match": {
                "createTime": { '$gte': body.sTime, '$lt': body.eTime },
                "appKey": appKey,
                "page": body.keywords
            }
        },
        {
            "$group": {
                "_id": '$error',
                "list": { '$push': "$page" }
            }
        },
        {
            "$project": {
                "_id": 0,
                'count': { '$size': '$list' },
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