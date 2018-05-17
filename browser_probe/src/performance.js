// 用于测量访问速度
let t = performance.timing;
function formatTime(time) {
    return time > 0 ? time : 0;
}


export let performanceTime = {
    // 1.区间阶段耗时
    //  DNS 解析耗时 
    dns: formatTime(t.domainLookupEnd - t.domainLookupStart),
    // TCP 连接耗时
    tcp: formatTime(t.connectEnd - t.connectStart),
    // SSL 安全连接耗时
    ssl: formatTime(t.connectEnd - t.secureConnectionStart),
    // Time to First Byte（TTFB），网络请求耗时 TTFB 有多种计算方式，ARMS 以 Google Development 定义为准
    ttfb: formatTime(t.responseStart - t.requestStart),
    // 数据传输耗时
    trans: formatTime(t.responseEnd - t.responseStart),
    // DOM 解析耗时
    dom: formatTime(t.domInteractive - t.responseEnd),
    // 资源加载耗时
    res: formatTime(t.domInteractive - t.domContentLoadedEventEnd),

    // 2.关键性能指标
    // 首包时间
    firstbyte: formatTime(t.responseStart - t.domainLookupStart),
    // First Paint Time, 首次渲染时间 / 白屏时间
    fpt: formatTime(t.responseEnd - t.fetchStart),
    // Time to Interact，首次可交互时间
    tti: formatTime(t.domInteractive - t.fetchStart),
    // HTML 加载完成时间， 即 DOM Ready 时间
    ready: formatTime(t.domContentLoadEventEnd - t.fetchStart),
    // 页面完全加载时间
    load: formatTime(t.loadEventStart - t.fetchStart),
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
};