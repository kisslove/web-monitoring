
import { params,currentPageUrl } from './util';
import { performanceTime } from './performance';
import { terminalInfo } from './terminalInfo';
import{networkInfo} from './networkInfo';
import{getNetworkInfoAsync}from './networkInfo';
//上报api数据
function uploadUserData(type, ext) {
  switch (type) {
    case 1:
      sendPerfData()
      break;
    case 2:
      sendApiData(ext)
      break;
    case 3:
      sendJsErrData(ext)
      break;
    case 4:
      sendPageVData(ext)
      break;
    default:
      console.log('未定义类型');
      break;
  }

}

// 发送性能数据
function sendPerfData() {
  var temp = { type: 'perf', page: location.host };
  getNetworkInfoAsync().then(v=>{
    _.extend(temp, terminalInfo,v, performanceTime);
    send(temp);
  });
  
}
// 发送api请求数据
function sendApiData(ext) {
  var temp = { type: 'api', page: currentPageUrl() };
  getNetworkInfoAsync().then(v=>{
    _.extend(temp, terminalInfo,v, ext);
    send(temp);
  });
}

// 发送js错误数据
function sendJsErrData(ext) {
  var temp = { type: 'js', page: currentPageUrl() };
  getNetworkInfoAsync().then(v=>{
    _.extend(temp, terminalInfo,v, ext);
    send(temp);
  });
}

// 发送PV数据
function sendPageVData() {
  var temp = { type: 'pv', page: currentPageUrl() };
  getNetworkInfoAsync().then(v=>{
    _.extend(temp, terminalInfo,v);
    send(temp);
  });
}

// 发送数据
function send(param) {
  console.log(param, 123);
  let img = new Image();
  img.src = window.__ml && window.__ml.config.imgUrl + params(param);
  img.onload = img.onerror = function () {
    img = undefined;
  };
}

window.__ml.uploadUserData=uploadUserData;

// api接口调用成功率上报
window.__ml.api=function(api,success,time,code,msg){
  sendApiData({
    api: api,
    success: success,
    time: time,
    code: code,
    msg: msg
  });
};
// js error 上报
window.__ml.error=function(errorobj){
  sendJsErrData({
    error: errorobj
  });
};

export { uploadUserData }