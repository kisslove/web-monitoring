//终端：操作系统，浏览器信息，设备，分辨率
declare var window:any;
export var terminalInfo = {
    /**
    * 操作系统
    */
    os: (function detectOS() {
        var sUserAgent = navigator.userAgent;

        var isWin = (navigator.platform == "Win64") || (navigator.platform == "Win32") || (navigator.platform == "Windows");
        var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
        if (isMac) return "mac";
        var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
        if (isUnix) return "unix";
        var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
        if (isLinux) {
            var bIsAndroid = sUserAgent.toLowerCase().match(/android/i).toString() == "android";
            if (bIsAndroid) return "android";
            else return "linux";
        }

        var isiOS = !!sUserAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        if (isiOS) {
            return "ios";
        }
        if (isWin) {
            var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
            if (isWin2K) return "win2000";
            var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 ||
                sUserAgent.indexOf("Windows XP") > -1;
            if (isWinXP) return "winXP";
            var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
            if (isWin2003) return "win2003";
            var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
            if (isWinVista) return "WinVista";
            var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
            if (isWin7) return "win7";
            var isWin7 = sUserAgent.indexOf("Windows NT 10.0") > -1 || sUserAgent.indexOf("Windows 10") > -1;
            if (isWin7) return "win10";
        }
        return "Others";
    })(),
    /**
     * 浏览器信息
     */
    bs: (function detectBS() {
        var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
        var isOpera = userAgent.indexOf("Opera") > -1;
        if (isOpera) {
            return "opera"
        }; //判断是否Opera浏览器

        if (userAgent.indexOf("Firefox") > -1) {
            return "firefox";
        } //判断是否Firefox浏览器

        if (!!userAgent.toLowerCase().match(/ubrowser/i)) {
            return "UC";
        }
        
        if (!!userAgent.toLowerCase().match(/bidubrowser/i)) {
            return "百度";
        }

        if (!!userAgent.toLowerCase().match(/metasr/i)) {
            return "搜狗";
        }

        if (!!userAgent.toLowerCase().match(/metasr/i)) {
            return "搜狗";
        }

        if (!!userAgent.toLowerCase().match(/mqqbrowser|qzone|qqbrowser/i)) {
            return "qq";
        }

        if (userAgent.toLowerCase().indexOf('se 2.x')>-1) {
            return "sougo";
        }

        if (userAgent.indexOf("Edge") > -1) {
            return "edge";
        } //判断是否Edge浏览器

        if (userAgent.indexOf("Chrome") && window.chrome) {
            let is360 = _mime("type", "application/vnd.chromium.remoting-viewer");
            function _mime(option, value) {
                var mimeTypes = navigator.mimeTypes;
                for (var mt in mimeTypes) {
                    if (mimeTypes[mt][option] == value) {
                        return true;
                    }
                }
                return false;
            }
            if(is360){
                return '360';
            }
            return "chrome";
        }
        if (userAgent.indexOf("Safari") > -1) {
            return "safari";
        } //判断是否Safari浏览器

        if (userAgent.indexOf("Trident") > -1 || userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
            let reIE = new RegExp("MSIE (\\d+\\.\\d+);");
            reIE.test(userAgent);
            let fIEVersion = parseFloat(RegExp["$1"]);
            if (fIEVersion == 7) { return "ie7"; }
            else if (fIEVersion == 8) { return "ie8"; }
            else if (fIEVersion == 9) { return "ie9"; }
            else if (fIEVersion == 10) { return "ie10"; }
            else if (fIEVersion == 11) { return "ie11"; }
            else
                return "ie";
        }; //判断是否IE浏览器
        return "Others";
    })(),
    /**
     * 浏览器分辨率
     */
    pageWh: (function detectPageWh() {
        var wjb51 = screen.width;
        var hjb51 = screen.height;
        return wjb51 + 'x' + hjb51;
    })(),
    ua: (function () {
        return navigator.userAgent;
    })()
};



