// 用于测量访问速度
let performancetTiming = performance.timing;

export let performanceTime = {
    // 1.阶段耗时
    //  DNS 解析耗时 
    dns: performancetTiming.domainLookupEnd - performancetTiming.domainLookupStart,
    // TCP 连接耗时
    tcp: performancetTiming.connectEnd - performancetTiming.connectStart,
    // SSL 安全连接耗时
    ssl: performancetTiming.connectEnd - performancetTiming.secureConnectionStart,
    // Time to First Byte（TTFB），网络请求耗时
    ttfb: performancetTiming.responseStart - performancetTiming.requestStart,
    // 数据传输耗时
    trans: performancetTiming.responseEnd - performancetTiming.responseStart,
    // DOM 解析耗时
    dom: performancetTiming.domInteractive - performancetTiming.responseEnd,
    // 资源加载耗时
    res: performancetTiming.domInteractive - performancetTiming.domContentLoadedEventEnd,
    
    // 2.关键性能指标
    // 首包时间
    firstbyte: performancetTiming.responseStart - performancetTiming.domainLookupStart,
    // First Paint Time, 首次渲染时间 / 白屏时间
    fpt: performancetTiming.responseEnd - performancetTiming.fetchStart,
    // Time to Interact，首次可交互时间
    tti: performancetTiming.domInteractive - performancetTiming.fetchStart,
    // HTML 加载完成时间， 即 DOM Ready 时间
    ready: performancetTiming.domContentLoadEventEnd - performancetTiming.fetchStart,
    // 页面完全加载时间
    load: performancetTiming.loadEventStart - performancetTiming.fetchStart
};