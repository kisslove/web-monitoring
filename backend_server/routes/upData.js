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

let uploadDataTaskList = [];

const solveData = () => {
    const tasks = uploadDataTaskList.splice(0, 5);
    tasks.forEach(r => {
        switch (r.type) {
            case 'pv':
                pvInfo.create(r);
                break;
            case 'js':
                jsError.create(r);
                break;
            case 'api':
                apiInfo.create(r);
                break;
            case 'perf':
                perfInfo.create(r);
                break;
            case 'resource':
                resourceInfo.create(r);
                break;
            case 'focusClick':
                focusClickInfo.create(r);
                break;
            case 'console':
                consoleInfo.create(r);
                break;
            default:
                break;
        }
    })
}

// 每10秒执行一次检查
setInterval(() => {
    solveData()
}, 10000);

/*上传数据 */
router.get('', util.getIp, function (req, res, next) {
    let temp = JSON.parse(req.query.paramsJson);
    temp = _.extend(temp, req.netInfo);
    temp.type = req.query.type;
    if (temp.type) {
        uploadDataTaskList.push(temp)
    }
   res.status(200).end();
});

module.exports = router;