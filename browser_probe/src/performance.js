
let performancetTiming=performance.timing;

let performanceTime={
    dns:performanceTimie.domainLookupEnd-performanceTimie.domainLookupStart,
    tcp:performanceTimie.connectEnd -performanceTimie.connectStart,

}

export {
    performanceTime
};