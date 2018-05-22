//网络：ip,运营商   地理位置：国家，省，市，经纬度
import $ from 'jquery';

// $.getJSON('//ip.wheff7.com/ipinfo', function(data) {
//    networkInfo={
//     //地理位置
//     city_nameCN:data[1]&&data[1]['city_nameCN'],
//     country_nameCN:data[1]&&data[1]['country_nameCN'],
//     latitude:data[1]&&data[1]['latitude'],
//     longitude:data[1]&&data[1]['longitude'],
//     mostSpecificSubdivision_nameCN:data[1]&&data[1]['mostSpecificSubdivision_nameCN'],
//     //网络信息
//     onlineip:data['onlineip'],
//     isp:data[2]&&data[2]['isp'],
//     organizationCN:data[2]&&data[2]['organizationCN'],
//    };
// });

export async function getNetworkInfoAsync(){
    let data = await $.getJSON('//ip.wheff7.com/ipinfo');
    console.log(data,123);
     return {
        //地理位置
        city_nameCN:data[1]&&data[1]['city_nameCN'],
        country_nameCN:data[1]&&data[1]['country_nameCN'],
        latitude:data[1]&&data[1]['latitude'],
        longitude:data[1]&&data[1]['longitude'],
        mostSpecificSubdivision_nameCN:data[1]&&data[1]['mostSpecificSubdivision_nameCN'],
        //网络信息
        onlineip:data['onlineip'],
        isp:data[2]&&data[2]['isp'],
        organizationCN:data[2]&&data[2]['organizationCN'],
       };
}


