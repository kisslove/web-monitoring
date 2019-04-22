var express = require('express');
var router = express.Router();
var jsError = require('../business/jsError');
var pvInfo = require('../business/pvInfo');
var apiInfo = require('../business/apiInfo');
var perfInfo = require('../business/perfInfo');
var resourceInfo = require('../business/resourceInfo');
var util = require('../utils/util');
var _ = require('lodash');
/*上传数据 */
router.get('', util.getIp, function(req, res, next) {
    let temp = JSON.parse(req.query.paramsJson);
    temp = _.extend(temp, req.netInfo);
    temp.type = req.query.type;
    switch (req.query.type) {
        case 'pv':
            pvInfo.create(temp);
            res.json({ state: 'ok' });
            break;
        case 'js':
            jsError.create(temp);
            res.json({ state: 'ok' });
            break;
        case 'api':
            apiInfo.create(temp);
            res.json({ state: 'ok' });
            break;
        case 'perf':
            perfInfo.create(temp);
            res.json({ state: 'ok' });
            break;
        case 'resource':
            resourceInfo.create(temp);
            res.json({ state: 'ok' });
            break;
        default:
            break;
    }
});

module.exports = router;