import _ from 'lodash';
import { uploadUserData } from './sendData';

if (window.__ml) {
    //监听perf
    window.addEventListener("load", () => {
        setTimeout(() => {
            uploadUserData(1);
        }, 10);
    });
    // document.onreadystatechange = function () {
    //     if (document.readyState === "complete") {
    //         setTimeout(() => {
    //             uploadUserData(1);
    //         }, 1000);
    //     }
    // };
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
        // console.log(this,Date.now(),'onLoadEnd');
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
        window.__ml.apiStartTime = Date.now();
    }

    //监听前端js
    window.addEventListener('error', function (ex) {
        // 一般事件的参数中会包含pos信息
        console.log(ex);
    });
}
