var express = require('express');
var router = express.Router();
var util = require('../utils/util');
var site = require('../business/site');
var jsError = require('../business/jsError');
var pvInfo = require('../business/pvInfo');
var apiInfo = require('../business/apiInfo');
var perfInfo = require('../business/perfInfo');
var jsError = require('../business/jsError');
var resourceInfo = require('../business/resourceInfo');
/* dashboard */
router.post('/SiteList', site.list);
router.get('/SiteList', site.list);
router.post('/RegisterSite',util.needToken, site.create);

//应用设置
router.post('/SiteSet', site.update);

//js错误率报警
router.post('/AlarmJsErrorUpdate',util.needToken, site.alarmJsErrorUpdate);
//api错误率报警
router.post('/AlarmApiErrorUpdate',util.needToken, site.alarmApiErrorUpdate);
//访问速度报警
router.post('/AlarmPerfSpeedUpdate',util.needToken, site.alarmPerfSpeedUpdate);


//用户访问路径
router.post('/userPathListStatis', function(req, res, next) {
    pvInfo.userPathListStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});


//资源加载情况
router.post('/resourceList', function(req, res, next) {
    resourceInfo.list(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// pv/uv
router.post('/PvAndUvStatis', function(req, res, next) {
    pvInfo.pvAndUvStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});
// 访问top页
router.post('/PageTopStatis', function(req, res, next) {
    pvInfo.pageTopStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 应用总览-geo
router.post('/GeoStatis', function(req, res, next) {
    pvInfo.geoStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 应用总览-BrowserStatis
router.post('/BrowserStatis', function(req, res, next) {
    pvInfo.browserStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 应用总览-OsStatis
router.post('/OsStatis', function(req, res, next) {
    pvInfo.osStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 应用总览-PageWhStatis
router.post('/PageWhStatis', function(req, res, next) {
    pvInfo.pageWhStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});


// 访问页面-PageRankStatis
router.post('/PageRankStatis', function(req, res, next) {
    pvInfo.pageRankStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 访问明细-jsErrorTrackPath
router.post('/JsErrorTrackPath', function(req, res, next) {
    jsError.jsErrorTrackPath(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});


// 访问页面-jsErrorRate
router.post('/JsErrorRate', function(req, res, next) {
    jsError.jsErrorRate(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 应用总览（访问速度）-perfSpeedCompareAndAvg
router.post('/PerfSpeedCompareAndAvg', function(req, res, next) {
    perfInfo.perfSpeedCompareAndAvg(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 应用总览（JS错误率）-jsErrorRateCompareAndAvg
router.post('/JsErrorRateCompareAndAvg', function(req, res, next) {
    jsError.jsErrorRateCompareAndAvg(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 应用总览（Api成功率）-apiSuccRateCompareAndAvg
router.post('/ApiSuccRateCompareAndAvg', function(req, res, next) {
    apiInfo.apiSuccRateCompareAndAvg(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});


// 访问页面-jsAggregate
router.post('/JsAggregate', function(req, res, next) {
    jsError.jsAggregate(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 访问页面-apiCase
router.post('/ApiCase', function(req, res, next) {
    apiInfo.apiCase(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});


// 访问页面-addressMap
router.post('/AddressMap', function(req, res, next) {
    pvInfo.addressMap(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 访问页面-terminalStatis
router.post('/TerminalStatis', function(req, res, next) {
    pvInfo.terminalStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 访问速度-PageSpeedStatis
router.post('/PageSpeedStatis', function(req, res, next) {
    perfInfo.pageSpeedStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 访问速度-keyPerf
router.post('/KeyPerf', function(req, res, next) {
    perfInfo.keyPerf(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 访问速度-elapsedTime
router.post('/ElapsedTime', function(req, res, next) {
    perfInfo.elapsedTime(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 访问速度-perfGeo
router.post('/PerfGeo', function(req, res, next) {
    perfInfo.perfGeo(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 访问速度-terminalSpeed
router.post('/TerminalSpeed', function(req, res, next) {
    perfInfo.terminalSpeed(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});


// API请求-ApiStatis
router.post('/ApiStatis', function(req, res, next) {
    apiInfo.apiStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});


// API请求-apiSuccRate
router.post('/ApiSuccRate', function(req, res, next) {
    apiInfo.apiSuccRate(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});


// API请求-SuccRateGeo
router.post('/SuccRateGeo', function(req, res, next) {
    apiInfo.succRateGeo(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});


// API请求-succTerminal
router.post('/SuccTerminal', function(req, res, next) {
    apiInfo.succTerminal(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// API请求-msgCallDetails
router.post('/MsgCallDetails', function(req, res, next) {
    apiInfo.msgCallDetails(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});
// API请求-msgGeo
router.post('/MsgGeo', function(req, res, next) {
    apiInfo.msgGeo(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// API请求-msgTerminal
router.post('/MsgTerminal', function(req, res, next) {
    apiInfo.msgTerminal(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// API请求-succOrFailTimes
router.post('/SuccOrFailTimes', function(req, res, next) {
    apiInfo.succOrFailTimes(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});


// API请求-elapsedTimeGeo
router.post('/ElapsedTimeGeo', function(req, res, next) {
    apiInfo.elapsedTimeGeo(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// API请求-elapsedTimeTerminal
router.post('/ElapsedTimeTerminal', function(req, res, next) {
    apiInfo.elapsedTimeTerminal(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// 访问明细
router.post('/List', function(req, res, next) {
    switch (req.body.type) {
        case 'pv':
            pvInfo.list(req).then((r) => {
                res.json(util.resJson({
                    IsSuccess: true,
                    Data: r
                }));
            }, (err) => {
                console.error(err);
                res.json(util.resJson({
                    IsSuccess: false,
                    Data: null
                }));
            });
            break;
        case 'js':
            jsError.list(req).then((r) => {
                res.json(util.resJson({
                    IsSuccess: true,
                    Data: r
                }));
            }, (err) => {
                console.error(err);
                res.json(util.resJson({
                    IsSuccess: false,
                    Data: null
                }));
            });
            break;
        case 'api':
            apiInfo.list(req).then((r) => {
                res.json(util.resJson({
                    IsSuccess: true,
                    Data: r
                }));
            }, (err) => {
                console.error(err);
                res.json(util.resJson({
                    IsSuccess: false,
                    Data: null
                }));
            });
            break;
        case 'perf':
            perfInfo.list(req).then((r) => {
                res.json(util.resJson({
                    IsSuccess: true,
                    Data: r
                }));
            }, (err) => {
                console.error(err);
                res.json(util.resJson({
                    IsSuccess: false,
                    Data: null
                }));
            });
            break;
        default:
            break;
    }
});

// 地理-GeoListStatis
router.post('/GeoListStatis', function(req, res, next) {
    pvInfo.geoListStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// visitSpeedStatic 关键性能指标(地理、终端)
router.post('/VisitSpeedStatic', function(req, res, next) {
    perfInfo.visitSpeedStatic(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});


// apiSuccRateStatic api成功率(地理、终端)
router.post('/ApiSuccRateStatic', function(req, res, next) {
    apiInfo.apiSuccRateStatic(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

// TerminalListStatis 终端(bs/os/pageWh)
router.post('/TerminalListStatis', function(req, res, next) {
    pvInfo.terminalListStatis(req).then((r) => {
        res.json(util.resJson({
            IsSuccess: true,
            Data: r
        }));
    }, (err) => {
        console.error(err);
        res.json(util.resJson({
            IsSuccess: false,
            Data: null
        }));
    });
});

module.exports = router;