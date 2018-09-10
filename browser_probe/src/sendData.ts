
import { params, currentPageUrl } from './util';
import { terminalInfo } from './terminalInfo';
import { getNetworkInfoAsync } from './networkInfo';
// import * as _lodash from 'lodash';
declare var window:any
// declare var Object
//上报api数据
function uploadUserData(type, ext) {
  switch (type) {
    case 1:
      sendPerfData(ext);
      break;
    case 2:
      sendApiData(ext);
      break;
    case 3:
      sendJsErrData(ext);
      break;
    case 4:
      sendPageVData();
      break;
    default:
      console.log('未定义类型');
      break;
  }

}

// 发送性能数据
function sendPerfData(ext) {
  var temp = { page: location.host, appKey: window.__ml.config.appKey };
  getNetworkInfoAsync(function(v){
    Object.assign(temp, terminalInfo, v, ext);
    send({
      type: 'perf',
      paramsJson: JSON.stringify(temp)
    });
  });
}
// 发送api请求数据
function sendApiData(ext) {
  var temp = { page: currentPageUrl(), appKey: window.__ml.config.appKey };
  getNetworkInfoAsync(function(v){
    Object.assign(temp, terminalInfo, v, ext);
    send({
      type: 'api',
      paramsJson: JSON.stringify(temp)
    });
  });
}

// 发送js错误数据
function sendJsErrData(ext) {
  var temp = { page: currentPageUrl(), appKey: window.__ml.config.appKey };
  getNetworkInfoAsync(function(v){
    Object.assign(temp, terminalInfo, v, {error:encodeURIComponent(JSON.stringify(ext))});
    send({
      type: 'js',
      paramsJson: JSON.stringify(temp)
    });
  });
}

// 发送PV数据
function sendPageVData() {
  var temp = { page: currentPageUrl(), appKey: window.__ml.config.appKey };
  getNetworkInfoAsync(function(v){
    Object.assign(temp, terminalInfo, v);
    send({
      type: 'pv',
      paramsJson: JSON.stringify(temp)
    });
  });
}

// 发送数据
function send(param) {
  // console.log(param, 123); 
  let img = new Image();
  img.src = window.__ml && window.__ml.config.imgUrl + params(param);
  img.onload = img.onerror = function () {
    img = undefined;
  };
}


window.__ml.uploadUserData = uploadUserData;

// api接口调用成功率上报
window.__ml.api = function (api, success, time, code, msg) {
  sendApiData({
    api: api,
    success: success,
    time: time,
    code: code,
    msg: msg
  });
};
// js error 上报
window.__ml.error = function (errorobj) {
  sendJsErrData(errorobj);
};

export { uploadUserData }