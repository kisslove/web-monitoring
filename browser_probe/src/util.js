import _ from 'lodash';
function params(data){
    var str='';
    _.forEach(data,function(val,key){
        str+='&'+key+'='+encodeURIComponent(val);
    });
    return str.substr(1,str.length);
}

function currentPageUrl(){
    return window.__ml.config.hashRoute?location.hash.substr(2):location.href;
}


export {
    params,
    currentPageUrl
} 