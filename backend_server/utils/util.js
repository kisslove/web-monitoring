var CryptoJS = require("crypto-js");
var userInfo = require("../business/userInfo");
var util = require("../utils/util");
const searcher = require("evenboy-ip2region").create();
let provinceData = [
  "北京市",
  "天津市",
  "上海市",
  "江苏省",
  "浙江省",
  "安徽省",
  "福建省",
  "江西省",
  "湖南省",
  "山东省",
  "河南省",
  "内蒙古自治区",
  "湖北省",
  "宁夏回族自治区",
  "新疆维吾尔自治区",
  "广东省",
  "西藏自治区",
  "海南省",
  "广西壮族自治区",
  "四川省",
  "河北省",
  "贵州省",
  "重庆市",
  "山西省",
  "云南省",
  "辽宁省",
  "陕西省",
  "吉林省",
  "甘肃省",
  "黑龙江省",
  "青海省",
  "台湾省",
];
const _KEY = "28756942659325487412569845231586"; //32位
const _IV = "8536874512548456"; //16位
const adminUserId = "5c3dce2b5a0e170a74e608c6";
exports.adminUserId = adminUserId;

exports.computeSTimeAndEtime = function (body) {
  body.eTime = new Date(body.eTime);
  body.sTime = new Date(body.sTime);
  switch (body.TimeQuantum) {
    case 0: //最近30分钟
      body.eTime = new Date();
      body.sTime = new Date(
        new Date().setMinutes(new Date().getMinutes() - 30)
      );
      break;
    case 1: //最近60分钟
      body.eTime = new Date();
      body.sTime = new Date(
        new Date().setMinutes(new Date().getMinutes() - 60)
      );
      break;
    case 2: //最近4小时
      body.eTime = new Date();
      body.sTime = new Date(
        new Date().setMinutes(new Date().getMinutes() - 60 * 4)
      );
      break;
    case 3: //最近12小时
      body.eTime = new Date();
      body.sTime = new Date(
        new Date().setMinutes(new Date().getMinutes() - 60 * 12)
      );
      break;
    case 4: //最近24小时
      body.eTime = new Date();
      body.sTime = new Date(
        new Date().setMinutes(new Date().getMinutes() - 60 * 24)
      );
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
  }
  return body;
};

exports.computeSTimeAndEtimeAndTimeDivider = function (body) {
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
      body.timeDivider = 1000 * 60 * 60 * 24; /*聚合时间段,默认按天*/
    }
  }

  switch (body.TimeQuantum) {
    case 0: //最近30分钟
      body.eTime = new Date();
      body.sTime = new Date(
        new Date().setMinutes(new Date().getMinutes() - 30)
      );
      body.timeDivider = 1000 * 60 * 5;
      break;
    case 1: //最近60分钟
      body.eTime = new Date();
      body.sTime = new Date(
        new Date().setMinutes(new Date().getMinutes() - 60)
      );
      body.timeDivider = 1000 * 60 * 10;
      break;
    case 2: //最近4小时
      body.eTime = new Date();
      body.sTime = new Date(
        new Date().setMinutes(new Date().getMinutes() - 60 * 4)
      );
      body.timeDivider = 1000 * 60 * 30;
      break;
    case 3: //最近12小时
      body.eTime = new Date();
      body.sTime = new Date(
        new Date().setMinutes(new Date().getMinutes() - 60 * 12)
      );
      body.timeDivider = 1000 * 60 * 60;
      break;
    case 4: //最近24小时
      body.eTime = new Date();
      body.sTime = new Date(
        new Date().setMinutes(new Date().getMinutes() - 60 * 24)
      );
      body.timeDivider = 1000 * 60 * 60;
      break;
    case 5: //最近3天
      body.eTime = new Date();
      body.sTime = new Date(new Date().setDate(new Date().getDate() - 3));
      body.timeDivider = 1000 * 60 * 60 * 12;
      break;
    case 6: //最近7天
      body.eTime = new Date();
      body.sTime = new Date(new Date().setDate(new Date().getDate() - 7));
      body.timeDivider = 1000 * 60 * 60 * 12;
      break;
    default:
      body.eTime = new Date(body.eTime);
      body.sTime = new Date(body.sTime);
      break;
  }
  return body;
};

exports.resJson = function (options) {
  var temp = new Object();
  temp.IsSuccess = (options && options.IsSuccess) || false;
  temp.Data = options.Data;
  return temp;
};

exports.getIp = function (req, res, next) {
  let netInfo = {
    city_nameCN: "未知",
    country_nameCN: "未知",
    latitude: 0,
    longitude: 0,
    mostSpecificSubdivision_nameCN: "未知",
    onlineip: "0.0.0.2", //请求错误（标志）
    isp: "未知",
    organizationCN: "未知",
  };
  var tempIp = getClientIP(req);
  if (tempIp == "::1") {
    netInfo = {
      city_nameCN: "内网",
      country_nameCN: "内网",
      latitude: 0,
      longitude: 0,
      mostSpecificSubdivision_nameCN: "内网",
      onlineip: "0.0.0.1", //本地网络（标志）
      isp: "内网",
      organizationCN: "内网",
    };
    req.netInfo = netInfo;
    next();
    return;
  }
  tempIp = tempIp.split(":")[tempIp.split(":").length - 1];
  // var tempData = searcher.btreeSearchSync(tempIp);
  searcher.binarySearch(tempIp, function (err, tempData) {
    if (err) {
      req.netInfo = netInfo;
      next();
    }
    if (tempData.region) {
      let temp = tempData.region.split("|");
      netInfo.country_nameCN = temp[0] == "0" ? "内网" : temp[0]; //国家
      netInfo.mostSpecificSubdivision_nameCN =
        temp[2] == "0" ? "内网" : temp[2]; //省
      netInfo.city_nameCN = temp[3] == "0" ? "内网" : temp[3]; //市
      netInfo.isp = temp[4] == "0" ? "内网" : temp[4]; //isp
      netInfo.organizationCN = temp[4] == "0" ? "内网" : temp[4]; //isp
      netInfo.onlineip = tempIp; //ip
      if (netInfo.mostSpecificSubdivision_nameCN == "澳门") {
        netInfo.mostSpecificSubdivision_nameCN = "澳门特别行政区";
      } else if (netInfo.mostSpecificSubdivision_nameCN == "香港") {
        netInfo.mostSpecificSubdivision_nameCN = "香港特别行政区";
      } else if (netInfo.mostSpecificSubdivision_nameCN == "台湾") {
        netInfo.mostSpecificSubdivision_nameCN = "台湾省";
      } else if (netInfo.mostSpecificSubdivision_nameCN) {
        provinceData.forEach(function (val) {
          if (val.indexOf(netInfo.mostSpecificSubdivision_nameCN) != -1) {
            netInfo.mostSpecificSubdivision_nameCN = val;
          }
        });
      }
    }
    req.netInfo = netInfo;
    next();
  });
};

/**************************************************************
 *字符串加密
 *   str：需要加密的字符串
 ****************************************************************/
exports.encrypt = (str) => {
  var key = CryptoJS.enc.Utf8.parse(_KEY);
  var iv = CryptoJS.enc.Utf8.parse(_IV);
  var encrypted = "";
  var srcs = CryptoJS.enc.Utf8.parse(str);
  encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.ciphertext.toString();
};

/**************************************************************
 *字符串解密
 *   str：需要解密的字符串
 ****************************************************************/
exports.decrypt = (str) => {
  var key = CryptoJS.enc.Utf8.parse(_KEY);
  var iv = CryptoJS.enc.Utf8.parse(_IV);
  var encryptedHexStr = CryptoJS.enc.Hex.parse(str);
  var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  var decrypt = CryptoJS.AES.decrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
};

exports.resolveToken = (req, res, next) => {
  let tempToken = req.headers["authorization"];
  if (tempToken) {
    let s;
    try {
      s = this.decrypt(tempToken);
    } catch (error) {
      res.status(401).end();
      return;
    }
    let userId = s.split("@")[0];
    userInfo.validToken(userId).then(
      (r) => {
        if (r.token == tempToken) {
          req.userId = userId;
          next();
        } else {
          res.status(401).json(
            util.resJson({
              IsSuccess: false,
              Data: "Token不一致",
            })
          );
        }
      },
      (err) => {
        res.status(401).json(
          util.resJson({
            IsSuccess: false,
            Data: "Token不一致",
          })
        );
      }
    );
  } else {
    next();
  }
};

exports.needToken = (req, res, next) => {
  if (req.userId) {
    next();
  } else {
    res.status(403).json(
      util.resJson({
        IsSuccess: false,
        Data: "未授权",
      })
    );
  }
};

exports.needAdminToken = (req, res, next) => {
  if (req.userId === adminUserId) {
    next();
  } else {
    res.status(403).json(
      util.resJson({
        IsSuccess: false,
        Data: "未授权",
      })
    );
  }
};

function getClientIP(req) {
  var ip =
    req.headers["x-forwarded-for"] ||
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress ||
    "";
  if (ip.split(",").length > 0) {
    ip = ip.split(",")[0];
  }
  return ip;
}
