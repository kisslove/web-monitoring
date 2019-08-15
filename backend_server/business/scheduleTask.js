var Mongoose = require('mongoose');
var Agenda = require('agenda');
var nodemailer = require('nodemailer');
var JsModel = require('../models/jsModel');
var PvModel = require('../models/pvModel');
var ApiModel = require('../models/apiModel');
var PerfModel = require('../models/perfModel');
var SiteModel = require('../models/siteModel');
var _=require('lodash');

const mongoConnectionString = 'mongodb://127.0.0.1:27017/agendatask';
const agenda = new Agenda({ db: { address: mongoConnectionString } });
agenda.processEvery('30 seconds');

const transporter = nodemailer.createTransport({
    "host": "smtpdm.aliyun.com",
    "port": 25,
    "secureConnection": true, // use SSL, the port is 465
    "auth": {
        "user": 'admin@hubing.online',
        "pass": '*********'
    }
});

async function sendEmail(options) {
    let appName = options.appKey;//站点名称
    let appKey = new Mongoose.Types.ObjectId(options.appKey);
    let appInfo = await SiteModel.findOne({ appKey: appKey });
    if (appInfo) {
        appName = appInfo.appName;
    }
    let body = '';
    let subject = '';
    let result;
    switch (options.alarmType) {
        case 'jsError':
            result = await checkjsErrorResult(options);
            body = `<p>${options.email}</p><p style="margin-left:24px;">你好，前端监控平台（<a href="hubing.online:8083" target="_blank">hubing.online:8083</a>）发现您在平台创建的【${appName}】系统触发JavaScript错误临界值，错误率为：<i style="color:red">${result * 100}%</i>，请前往系统及时处理。</p><p style="text-align:right;color:#40A9FF;">前端监控平台管理员</p>`;
            subject = 'JavaScript错误报警提醒';
            break;
        case 'apiError':
            result = await checkApiErrorResult(options);
            body = `<p>${options.email}</p><p style="margin-left:24px;">你好，前端监控平台（<a href="hubing.online:8083" target="_blank">hubing.online:8083</a>）发现您在平台创建的【${options.appName}】系统触发API请求错误临界值，错误率为：<i style="color:red">${result * 100}%</i>，请前往系统及时处理。</p><p style="text-align:right;color:#40A9FF;">前端监控平台管理员</p>`;
            subject = 'API错误报警提醒';
            break;
        case 'perfSpeed':
            result = await checkPerfSpeedResult(options);
            body = `<p>${options.email}</p><p style="margin-left:24px;">你好，前端监控平台（<a href="hubing.online:8083" target="_blank">hubing.online:8083</a>）发现您在平台创建的【${options.appName}】系统触发访问速度临界值，目前访问速度平均值为：<i style="color:red">${result}</i>，请前往系统及时处理。</p><p style="text-align:right;color:#40A9FF;">前端监控平台管理员</p>`;
            subject = '访问速度报警提醒';
            break;
        default:
            break;
    };
    var mailOptions = {
        from: '前端监控平台管理员<admin@hubing.online>', // sender address mailfrom must be same with the user
        to: options.email, // list of receivers
        subject: subject, // Subject line
        replyTo: '676022504@qq.com',//custom reply address
        html: body, // html body
    };

    if (result * 100 < options.limitValue) return;

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Message sent: ' + error);
        }
        console.log('Message sent: ' + info.response);
    });
}

//任务1：统计用户站点js错误达到临界值
async function checkjsErrorResult(options) {
    let appKey = new Mongoose.Types.ObjectId(options.appKey);
    let sTime = new Date(new Date().setMinutes(new Date().getMinutes() - options.times));
    let eTime = new Date();
    let matchCond = {
        "createTime": {
            '$gte': sTime,
            '$lte': eTime
        },
        "appKey": appKey
    };

    // 查询当前阶段错误率
    let r1 = await JsModel.find(matchCond).countDocuments();
    let r2 = await PvModel.find(matchCond).countDocuments();
    let rate1 = isNaN(r1 / r2) ? 0 : (r1 / r2);
    return rate1;
}

//任务2：统计用户站点API错误率达到临界值
async function checkApiErrorResult(options) {
    let appKey = new Mongoose.Types.ObjectId(options.appKey);
    let sTime = new Date(new Date().setMinutes(new Date().getMinutes() - options.times));
    let eTime = new Date();
    let matchCond = {
        "createTime": {
            '$gte': sTime,
            '$lte': eTime
        },
        "appKey": appKey
    };
    // 查询当前阶段错误率
    let r1 = await ApiModel.find(_.assign({ success: false }, matchCond)).countDocuments();
    let r2 = await ApiModel.find(matchCond).countDocuments();
    let rate1 = isNaN(r1 / r2) ? 0 : (r1 / r2);
    return rate1;
}

//任务3：统计用户站点平均访问速度达到临界值
async function checkPerfSpeedResult(options) {
    let appKey = new Mongoose.Types.ObjectId(options.appKey);
    let sTime = new Date(new Date().setMinutes(new Date().getMinutes() - options.times));
    let eTime = new Date();
    let matchCond = {
        "createTime": {
            '$gte': sTime,
            '$lte': eTime
        },
        "appKey": appKey
    };
    // 查询当前阶段加载速度平均值
    let r1 = await PerfModel.find(matchCond);
    let r1Avg = r1.reduce((acc, val) => acc + val.load, 0) / r1.length;
    return r1Avg;
}


//创建/取消发送邮件任务
/*  
options.email 邮件
options.alarmType 邮件类型（jsError,apiError,perfSpeed）
options.times 间隔时间（s）
options.state 任务状态（true/false）
options.limitValue
options.appKey
*/
function createTask(options) {
    //取消任务
    agenda.cancel({ name: `send alarm email`, "data.appKey": options.appKey, "data.alarmType": options.alarmType });
    if (!options.state) {
        return;
    }
    (async function () {
        await agenda.start();
        let job = agenda.create(`send alarm email`, options);
        job.repeatEvery(`${options.times} minutes`, {
            skipImmediate: true
        });
        await job.save();
    })();
};


exports.startTask = function () {
    //定义任务
    agenda.define(`send alarm email`, (job, done) => {
        sendEmail(job.attrs.data);
        done();
    });
    //开启任务
    (async function () {
        await agenda.start();
    })();
};

exports.createTask = createTask;

