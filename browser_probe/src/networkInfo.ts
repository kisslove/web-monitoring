//网络：ip,运营商   地理位置：国家，省，市，经纬度
import * as $ from 'jquery';
$.support.cors = true;
declare var window: any;
var provinceData = [
    "北京市",
    "天津市",
    "上海市",
    "江苏省",
    "浙江省",
    "安徽省",
    "福建省",
    "江西省",
    "湖南省",
    "山东省",
    "河南省",
    "内蒙古自治区",
    "湖北省",
    "宁夏回族自治区",
    "新疆维吾尔自治区",
    "广东省",
    "西藏自治区",
    "海南省",
    "广西壮族自治区",
    "四川省",
    "河北省",
    "贵州省",
    "重庆市",
    "山西省",
    "云南省",
    "辽宁省",
    "陕西省",
    "吉林省",
    "甘肃省",
    "黑龙江省",
    "青海省",
    "台湾省"];
export function getNetworkInfoAsync(cb) {
    if (window.__ml.ipInfo) {
        cb(window.__ml.ipInfo);
    }
    else {
        let url = window.__ml.config.imgUrl.split('/Up')[0] + '/GetIp';
        $.get(url).then(function (data) {
            if(data.code==1){
                cb({
                    city_nameCN: '未知',
                    country_nameCN: '未知',
                    latitude: 0,
                    longitude: 0,
                    mostSpecificSubdivision_nameCN: '未知',
                    //网络信息
                    onlineip: '0.0.0.2',
                    isp: '未知',
                    organizationCN: '未知'
                });
                window.__ml.ipInfo={
                    city_nameCN: '未知',
                    country_nameCN: '未知',
                    latitude: 0,
                    longitude: 0,
                    mostSpecificSubdivision_nameCN: '未知',
                    //网络信息
                    onlineip: '0.0.0.2',
                    isp: '未知',
                    organizationCN: '未知'
                };
                return;
            }
            data=data.data;
            if (data.region == "澳门") {
                data.region = "澳门特别行政区";
            } else if (data.region == "香港") {
                data.region = "香港特别行政区";
            } else if (data.region == "台湾") {
                data.region = "台湾省";
            } else if (data.region) {
                provinceData.forEach(function (val) {
                    if (val.indexOf(data.region) != -1) {
                        data.region = val;
                    }
                })
            }
            window.__ml.ipInfo = {
                //地理位置
                city_nameCN: data.city,
                country_nameCN: data.country,
                latitude: 0,
                longitude: 0,
                mostSpecificSubdivision_nameCN: data.region,
                //网络信息
                onlineip: data.ip,
                isp: data.isp,
                organizationCN: data.isp
            };
            cb(window.__ml.ipInfo);
        }, function (err) {
            cb({
                city_nameCN: '未知',
                country_nameCN: '未知',
                latitude: 0,
                longitude: 0,
                mostSpecificSubdivision_nameCN: '未知',
                //网络信息
                onlineip: '0.0.0.1',
                isp: '未知',
                organizationCN: '未知'
            });
            window.__ml.ipInfo={
                city_nameCN: '未知',
                country_nameCN: '未知',
                latitude: 0,
                longitude: 0,
                mostSpecificSubdivision_nameCN: '未知',
                //网络信息
                onlineip: '0.0.0.1',
                isp: '未知',
                organizationCN: '未知'
            };
        });
    }
}

// export function getNetworkInfoAsync(cb) {
//     if (window.__ml.ipInfo) {
//         cb(window.__ml.ipInfo);
//     }
//     else {
//         $.getJSON('//ip.wheff7.com/ipinfo').then(function (data) {
//             if (data[1] && data[1]['country_nameCN'] == "澳门") {
//                 data[1]['mostSpecificSubdivision_nameCN'] = "澳门特别行政区";
//             }else if (data[1] && data[1]['country_nameCN'] == "香港") {
//                 data[1]['mostSpecificSubdivision_nameCN'] = "香港特别行政区";
//             }else if (data[1] && data[1]['country_nameCN'] == "台湾") {
//                 data[1]['mostSpecificSubdivision_nameCN'] = "台湾省";
//             }else if(data[1] && data[1]['mostSpecificSubdivision_nameCN']){
//                 provinceData.forEach(function(val){
//                     if(val.indexOf(data[1]['mostSpecificSubdivision_nameCN'])!=-1){
//                         data[1]['mostSpecificSubdivision_nameCN']=val;
//                     }
//                 })
//             }
//             window.__ml.ipInfo = {
//                 //地理位置
//                 city_nameCN: data[1] && data[1]['city_nameCN'],
//                 country_nameCN: data[1] && data[1]['country_nameCN'],
//                 latitude: data[1] && data[1]['latitude'],
//                 longitude: data[1] && data[1]['longitude'],
//                 mostSpecificSubdivision_nameCN: data[1] && data[1]['mostSpecificSubdivision_nameCN'],
//                 //网络信息
//                 onlineip: data['onlineip'],
//                 isp: data[2] && data[2]['isp'],
//                 organizationCN: data[2] && data[2]['organizationCN']
//             };
//             cb(window.__ml.ipInfo);
//         }, function (err) {
//             cb({
//                 city_nameCN: '未知',
//                 country_nameCN: '未知',
//                 latitude: 0,
//                 longitude: 0,
//                 mostSpecificSubdivision_nameCN: '未知',
//                 //网络信息
//                 onlineip: '0.0.0.0',
//                 isp: '未知',
//                 organizationCN: '未知'
//             });
//         });
//     }
// }


