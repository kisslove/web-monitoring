
// import 'core-js/es5';
// import 'core-js/es6/symbol';
// import 'core-js/es6/object';
// import 'core-js/es6/function';
// import 'core-js/es6/parse-int';
// import 'core-js/es6/parse-float';
// import 'core-js/es6/number';
// import 'core-js/es6/math';
// import 'core-js/es6/string';
// import 'core-js/es6/date';
// import 'core-js/es6/array';
// import 'core-js/es6/regexp';
// import 'core-js/es6/map';
// import 'core-js/es6/weak-map';
// import 'core-js/es6/set';
// import * as _lodash from 'lodash';
import { uploadUserData } from './sendData';
import { itemContains } from './util';
declare var window: any;
// import { performanceTime } from './performance';
let apiWhiteList = ["/GetIp","//ip.taobao.com/service/getIpInfo.php", '/sockjs-node/', "/signalr/abort",];
//监听perf
function formatTime(time) {
    return time > 0 && time < 100000 ? time : 0;
}

function onLoadEnd() {
    if (itemContains(apiWhiteList, this.responseURL || this.__zone_symbol__xhrURL) != -1) {
        return;
    }
    var time = Date.now() - window.__ml.apiStartTime;
    uploadUserData(2, {
        api: this.responseURL,
        success: this.status == 200 ? true : false,
        time: time,
        code: this.status,
        msg: this.status == 200 ? "成功" : this.statusText
    });
}
function onError(xhr, textStatus, errorThrown) {
    if (itemContains(apiWhiteList, this.responseURL || this.__zone_symbol__xhrURL) != -1) {
        return;
    }
    var time = Date.now() - window.__ml.apiStartTime;
    uploadUserData(2, {
        api: this.responseURL || this.__zone_symbol__xhrURL,
        success: false,
        time: time,
        code: this.status,
        msg: this.statusText
    });
}

function onLoadStart() {
    if (itemContains(apiWhiteList, this.responseURL || this.__zone_symbol__xhrURL) != -1) {
        return;
    }
    window.__ml.apiStartTime = Date.now();
}

function jsError($event,a,b,c) {
    console.log($event,a,b,c);
    // uploadUserData(3, event);
}
if (window.__ml) {

    let performanceTime = function () {
        var timing = performance.timing;
        var loadTime = timing.loadEventEnd - timing.navigationStart;//过早获取时,loadEventEnd有时会是0
        if (loadTime <= 0) {
            // 未加载完，延迟200ms后继续times方法，直到成功
            setTimeout(function () {
                performanceTime();
            }, 200);
            return;
        }
        uploadUserData(1, {
            // 1.区间阶段耗时
            //  DNS 解析耗时 
            dns: formatTime(timing.domainLookupEnd - timing.domainLookupStart),
            // TCP 连接耗时
            tcp: formatTime(timing.connectEnd - timing.connectStart),
            // SSL 安全连接耗时
            ssl: formatTime(timing.connectEnd - timing.secureConnectionStart),
            // Time to First Byte（TTFB），网络请求耗时 TTFB 有多种计算方式，ARMS 以 Google Development 定义为准
            ttfb: formatTime(timing.responseStart - timing.requestStart),
            // 数据传输耗时
            trans: formatTime(timing.responseEnd - timing.responseStart),
            // DOM 解析耗时
            dom: formatTime(timing.domInteractive - timing.responseEnd),
            // 资源加载耗时
            res: formatTime(timing.loadEventStart - timing.domContentLoadedEventEnd),
            // 2.关键性能指标
            // 首包时间
            firstbyte: formatTime(timing.responseStart - timing.domainLookupStart),
            // First Paint Time, 首次渲染时间 / 白屏时间
            fpt: formatTime(timing.responseEnd - timing.fetchStart),
            // Time to Interact，首次可交互时间
            tti: formatTime(timing.domInteractive - timing.fetchStart),
            // HTML 加载完成时间， 即 DOM Ready 时间
            ready: formatTime(timing.domContentLoadedEventEnd - timing.fetchStart),
            // 页面完全加载时间
            load: function () {
                return formatTime(timing.loadEventEnd - timing.fetchStart);
            }(),
            navt: (function () {
                let type = "";
                switch (performance.navigation.type) {
                    case 0:
                        type = 'NAVIGATE';
                        break;
                    case 1:
                        type = 'RELOAD';
                        break;
                    case 2:
                        type = 'BACK_FORWARD';
                        break;
                    case 255:
                        type = 'RESERVED';
                        break;
                }
                return type;
            })()
        });
    }

    window.addEventListener("load", function () {
        performanceTime();
    });

    //监听pv
    (function (window) {
        // 如果浏览器原生支持该事件,则退出  
        var location = window.location,
            oldURL = location.href,
            oldHash = location.hash;
        // 每隔100ms检测一下location.hash是否发生变化
        setInterval(function () {
            var newURL = location.href,
                newHash = location.hash;
            // console.log(newURL,newHash,window.__ml.config.hashRoute);
            // 如果hash发生了变化,且绑定了处理函数...
            if (newHash != oldHash && window.__ml.config.hashRoute) {
                oldURL = newURL;
                oldHash = newHash;
                uploadUserData(4, null);
            }
            if (newURL != oldURL && !window.__ml.config.hashRoute) {
                oldURL = newURL;
                oldHash = newHash;
                uploadUserData(4, null);
            }
        }, 500);

    })(window);


    //监听API
    if (!window.__ml.config.disableHook) {
        (function (xhr) {
            // Capture request before any network activity occurs:
            var send = xhr.send;
            xhr.send = function (data) {
                this.addEventListener('loadstart', onLoadStart);
                this.addEventListener('loadend', onLoadEnd);
                this.addEventListener('error', onError);
                return send.apply(this, arguments);
            };
        })(XMLHttpRequest.prototype);
    }



    if (!window.__ml.config.disableJS) {
        // 监听js错误 （注：Angular2+不会触发）
        /** 
    * @param {String} errorMessage  错误信息 
    * @param {String} scriptURI   出错的文件 
    * @param {Long}  lineNumber   出错代码的行号 
    * @param {Long}  columnNumber  出错代码的列号 
    * @param {Object} errorObj    错误的详细信息，Anything 
    */
        window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
            uploadUserData(3, {
                errorMessage: errorMessage,
                scriptURI: scriptURI,
                lineNumber: lineNumber,
                columnNumber: columnNumber,
                errorObj: errorObj
            })
        };
    }
}


