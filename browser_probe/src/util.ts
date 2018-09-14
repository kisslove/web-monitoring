/**
 * 转换参数
 * @param data 
 */
function params(data){
    var str='';
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            str+='&'+key+'='+encodeURIComponent(data[key]);
        }
    }
    return str.substr(1,str.length);
}

/**
 * 获取当前url
 */
function currentPageUrl(){
    return (window as any).__ml.config.hashRoute?location.hash.substr(2):location.href;
}

/**
 * 判断元素是否在数组内
 * @param data 
 * @param item 
 */
function itemContains(data:Array<string>,item){
    var temp=-1;
    if(data.length>0){
        for (let i = 0, max = data.length;i<max; i++) {
            if(data[i]==item||item&&item.indexOf(data[i])!=-1)
            {
                temp= i;
                break;
            }
        }
    }
    return temp;
}

export {
    params,
    currentPageUrl,
    itemContains
} 