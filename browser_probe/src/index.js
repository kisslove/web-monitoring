import _ from 'lodash';
import { uploadUserData } from './sendData';
let apiWhiteList = ['http://ip.wheff7.com/ipinfo', "https://ip.wheff7.com/ipinfo"];
if (window.__ml) {
    //监听perf
    window.addEventListener("load", () => {
        setTimeout(() => {
            uploadUserData(1);
        }, 10);
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
                uploadUserData(4);
            }
            if (newURL != oldURL && !window.__ml.config.hashRoute) {
                newURL = newURL;
                oldHash = newHash;
                uploadUserData(4);
            }
        }, 500);

    })(window);


    //监听API
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

    function onLoadEnd() {
        if (_.indexOf(apiWhiteList, this.responseURL) != -1) {
            return;
        }
        var time = Date.now() - window.__ml.apiStartTime;
        uploadUserData(2, {
            api: this.responseURL,
            success: this.status == 200 ? true : false,
            time: time,
            code: this.status,
            msg: this.status == 200 ? '成功' : this.responseText
        });
    }
    function onError() {
        if (_.indexOf(apiWhiteList, this.responseURL) != -1) {
            return;
        }
        var time = Date.now() - window.__ml.apiStartTime;
        uploadUserData(2, {
            api: this.responseURL,
            success: false,
            time: time,
            code: this.status,
            msg: this.responseText
        });
    }

    function onLoadStart() {
        if (_.indexOf(apiWhiteList, this.responseURL) != -1) {
            return;
        }
        window.__ml.apiStartTime = Date.now();
    }


    // 监听js错误（注：Angular2+不会触发）
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


