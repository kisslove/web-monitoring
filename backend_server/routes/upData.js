var express = require('express');
var router = express.Router();
var jsError = require('../business/jsError');
var pvInfo = require('../business/pvInfo');
var apiInfo = require('../business/apiInfo');
var perfInfo = require('../business/perfInfo');
var resourceInfo = require('../business/resourceInfo');
var focusClickInfo = require('../business/focusClickInfo');
var consoleInfo = require('../business/consoleInfo');
var util = require('../utils/util');
var _ = require('lodash');
/*上传数据 */
router.get('', util.getIp, function (req, res, next) {
    let temp = JSON.parse(req.query.paramsJson);
    temp = _.extend(temp, req.netInfo);
    temp.type = req.query.type;
    switch (req.query.type) {
        case 'pv':
            pvInfo.create(temp);
            res.status(200).end();
            break;
        case 'js':
            jsError.create(temp);
            res.status(200).end();
            break;
        case 'api':
            apiInfo.create(temp);
            res.status(200).end();
            break;
        case 'perf':
            perfInfo.create(temp);
            res.status(200).end();
            break;
        case 'resource':
            resourceInfo.create(temp);
            res.status(200).end();
            break;
        case 'focusClick':
            focusClickInfo.create(temp);
            res.status(200).end();
            break;
        case 'console':
            consoleInfo.create(temp);
            res.status(200).end();
            break;
        default:
            break;
    }
});

module.exports = router;