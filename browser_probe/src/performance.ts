// 用于测量访问速度
let t = performance.timing;
function formatTime(time) {
    return time;
    // return time > 0 ? time : 0;
}

let performanceTime = function() {
    var timing = performance.timing;
    var loadTime = timing.loadEventEnd - timing.navigationStart;//过早获取时,loadEventEnd有时会是0
    if(loadTime <= 0) {
    // 未加载完，延迟200ms后继续times方法，直到成功
        setTimeout(function(){
            performanceTime();
        }, 200);
        return;
    }

    return {
        // 1.区间阶段耗时
        //  DNS 解析耗时 
        dns: formatTime(performance.timing.domainLookupEnd - performance.timing.domainLookupStart),
        // TCP 连接耗时
        tcp: formatTime(performance.timing.connectEnd - performance.timing.connectStart),
        // SSL 安全连接耗时
        ssl: formatTime(performance.timing.connectEnd - performance.timing.secureConnectionStart),
        // Time to First Byte（TTFB），网络请求耗时 TTFB 有多种计算方式，ARMS 以 Google Development 定义为准
        ttfb: formatTime(performance.timing.responseStart - performance.timing.requestStart),
        // 数据传输耗时
        trans: formatTime(performance.timing.responseEnd - performance.timing.responseStart),
        // DOM 解析耗时
        dom: formatTime(performance.timing.domInteractive - performance.timing.responseEnd),
        // 资源加载耗时
        res: formatTime(performance.timing.domInteractive - performance.timing.domContentLoadedEventEnd),
        // 2.关键性能指标
        // 首包时间
        firstbyte: formatTime(performance.timing.responseStart - performance.timing.domainLookupStart),
        // First Paint Time, 首次渲染时间 / 白屏时间
        fpt: formatTime(performance.timing.responseEnd - performance.timing.fetchStart),
        // Time to Interact，首次可交互时间
        tti: formatTime(performance.timing.domInteractive - performance.timing.fetchStart),
        // HTML 加载完成时间， 即 DOM Ready 时间
        ready: formatTime(performance.timing.domContentLoadedEventEnd - performance.timing.fetchStart),
        // 页面完全加载时间
        load: function(){
            return formatTime(performance.timing.loadEventEnd - performance.timing.fetchStart);
        }(),
        navt: (function () {
            switch (performance.navigation.type) {
                case 0:
                    return 'NAVIGATE';
                    break;
                case 1:
                    return 'RELOAD';
                    break;
                case 2:
                    return 'BACK_FORWARD';
                    break;
                case 255:
                    return 'RESERVED';
                    break;
    
            }
        })()
    }
}

export  {performanceTime} ;