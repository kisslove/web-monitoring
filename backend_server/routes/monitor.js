var express = require('express');
var router = express.Router();
var util = require('../utils/util');
var site = require('../business/site');
var jsError = require('../business/jsError');
var pvInfo = require('../business/pvInfo');
var apiInfo = require('../business/apiInfo');
var perfInfo = require('../business/perfInfo');
var jsError = require('../business/jsError');
/* dashboard */
router.post('/SiteList', site.list);
router.get('/SiteList', site.list);
router.post('/RegisterSite', site.create);

//应用设置
router.post('/SiteSet', site.update);

//应用总览
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

module.exports = router;