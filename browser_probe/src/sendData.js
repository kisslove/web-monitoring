
import {params}from './util';
import {performanceTime} from './performance';
import {terminalInfo} from './terminalInfo';

//上报api数据
/**
 *发送数据
 */
function send(param){
  let img=new Image();
  img.src=window.__ml&&window.__ml.config.imgUrl+params(param);
  img.onload=img.onerror=function(){
    img=undefined;
  }
}

function uploadUserData(type){
  if(type==1){
    sendPerfData();
  }
}

// 发送性能数据
function sendPerfData(){
  var temp={type:'perf',page:location.host};
  _.extend(temp,terminalInfo,performanceTime);
  console.log(temp);
  send(temp);
}

export{uploadUserData}