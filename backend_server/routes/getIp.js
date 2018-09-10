var express = require('express');
var router = express.Router();
const http = require('http');
/* GET home page. */
router.get('', function(req, res1, next) {
    console.log(getClientIP(req));
    var tempIp = getClientIP(req);
    if (tempIp == "::1") {
        res1.json({
            code: 1
        });
        return;
    }
    http.get(`http://ip.taobao.com/service/getIpInfo.php?ip=${tempIp}`, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
        let error;
        if (statusCode !== 200) {
            error = new Error('请求失败。\n' + `状态码: ${statusCode}`);
        }
        if (error) {
            console.error(error.message);
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData || null);
                res1.json(parsedData);
            } catch (e) {
                res1.json({
                    code: 1
                })
                console.error(e.message);
            }
        });
    }).on('error', (e) => {
        console.error(`错误: ${e.message}`);
    });
});

function getClientIP(req) {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.connection.remoteAddress || // 判断 connection 的远程 IP
        req.socket.remoteAddress || // 判断后端的 socket 的 IP
        req.connection.socket.remoteAddress;
};

module.exports = router;