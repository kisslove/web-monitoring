import { slideInDownAnimation1 } from './../../../animations';
import { ActivatedRoute } from '@angular/router';
import { Broadcaster } from './../../../monitor.common.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { HighchartConfig } from '../../../model/entity';
import * as HC_map from 'highcharts/highmaps';
import * as _ from 'lodash';
declare var window: any
@Component({
  selector: 'app-sys-index',
  templateUrl: './sys-index.component.html',
  styleUrls: ['./sys-index.component.scss'],
  animations: [slideInDownAnimation1]
})
export class SysIndexComponent implements OnInit {
  pv_uv_config: HighchartConfig
  bs_config: HighchartConfig
  os_config: HighchartConfig
  wh_config: HighchartConfig
  dl_config: HighchartConfig
  isSpinning = {
    spin1: true,
    spin2: true,
    spin3: true,
    spin4: true,
    spin5: true,
    spin6: true
  };
  unsubscribe = {
    sub1: null
  };
  compareRate={
    js:null,
    speed:null,
    api:null
  }
  appKey;
  top10Data = [];
  mapData = [];
  total_pv_uv: any = {};
  constructor(
    private http: HttpClient,
    private broadcaster: Broadcaster,
    private route: ActivatedRoute
  ) { }
  ngOnInit() {
    this.appKey = this.route.parent.snapshot.paramMap.get("appKey");
    this.unsubscribe.sub1 = this.broadcaster.on("choiceTimeToRender").subscribe((data: any) => {
      this.loadPvUvData(data.time, data.type);
      this.loadTop10Data(data.time, data.type);
      this.loadGeoData(data.time, data.type);
      this.loadBsData(data.time, data.type);
      this.loadOsData(data.time, data.type);
      this.loadWhData(data.time, data.type);
      this.JsErrorRateCompareAndAvg(data.time, data.type);
      this.PerfSpeedCompareAndAvg(data.time, data.type);
      this.ApiSuccRateCompareAndAvg(data.time, data.type);
    });

    
    if (window.globalTime) {
      this.loadPvUvData(window.globalTime.time, window.globalTime.type);
      this.loadTop10Data(window.globalTime.time, window.globalTime.type);
      this.loadGeoData(window.globalTime.time, window.globalTime.type);
      this.loadBsData(window.globalTime.time, window.globalTime.type);
      this.loadOsData(window.globalTime.time, window.globalTime.type);
      this.loadWhData(window.globalTime.time, window.globalTime.type);
      this.JsErrorRateCompareAndAvg(window.globalTime.time, window.globalTime.type);
      this.PerfSpeedCompareAndAvg(window.globalTime.time, window.globalTime.type);
      this.ApiSuccRateCompareAndAvg(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadPvUvData(null, 4);
      this.loadTop10Data(null, 4);
      this.loadGeoData(null, 4);
      this.loadBsData(null, 4);
      this.loadOsData(null, 4);
      this.loadWhData(null, 4);
      this.JsErrorRateCompareAndAvg(null, 4);
      this.PerfSpeedCompareAndAvg(null, 4);
      this.ApiSuccRateCompareAndAvg(null, 4);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.sub1.unsubscribe();

  }

  ngAfterViewInit(): void {
    this.broadcaster.broadcast('showGlobalTimer', true);
  }

  selectOver(data, type) {
    switch (type) {
      case 10:
        this.loadPvUvData(data.time, data.type);
        break;
      case 20:
        this.loadTop10Data(data.time, data.type);
        break;
      case 30:
        this.loadGeoData(data.time, data.type);
        break;
      case 40:
        this.loadBsData(data.time, data.type);
        break;
      case 50:
        this.loadOsData(data.time, data.type);
      case 60:
        this.loadWhData(data.time, data.type);
        break;
      default:
        break;
    }
  }

  
  
  // 加载Api成功率
  ApiSuccRateCompareAndAvg(time, type) {
    this.http.post("Monitor/ApiSuccRateCompareAndAvg", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.compareRate.api=new Number(d.Data).toFixed(2);
      }
    })
  }

  // 加载JS错误率
  JsErrorRateCompareAndAvg(time, type) {
    this.http.post("Monitor/JsErrorRateCompareAndAvg", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.compareRate.js=new Number(d.Data).toFixed(2);
      }
    })
  }

   //加载速度
   PerfSpeedCompareAndAvg(time, type) {
    this.http.post("Monitor/PerfSpeedCompareAndAvg", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.compareRate.speed=new Number(d.Data).toFixed(0);
      }
    })
  }

  //加载PV/UV数据
  loadPvUvData(time, type) {
    this.isSpinning.spin1 = true;
    this.http.post("Monitor/PvAndUvStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderPvUvChart(type, d.Data);
      }
      this.isSpinning.spin1 = false;
    })
  }
  //渲染PV/UV对比图
  renderPvUvChart(type, data) {

    let tempData = {
      pv: [],
      uv: []
    };

    this.total_pv_uv = {
      totalPv: data.totalPv,
      totalUv: data.totalUv
    };
    _.each(data.pvAndUvVmList, (val) => {
      tempData.pv.push([new Date(val.createTime).getTime(), val.pv]);
      tempData.uv.push([new Date(val.createTime).getTime(), val.uv]);
    });
    // tempData.pv.sort();
    // tempData.uv.sort();
    this.pv_uv_config = {
      type: 10,
      extProps: {
        minTickIntervalType: type
      },
      ext: {
        series: [{
          name: 'PV',
          data: tempData.pv
        }, {
          name: 'UV',
          data: tempData.uv
        }]
      }
    };
  }


  //加载Top10页面数据
  loadTop10Data(time, type) {
    this.isSpinning.spin2 = true;
    this.http.post("Monitor/PageTopStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      top: 8
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.top10Data = d.Data;
      }
      this.isSpinning.spin2 = false;
    })
  }


  //加载地理分布数据
  loadGeoData(time, type) {
    this.isSpinning.spin3 = true;
    this.http.post("Monitor/GeoStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        let tempData = [];
        _.each(d.Data, (val) => {
          tempData.push({
            name: val.provice,
            value: val.pv,
            pv: val.pv,
            uv: val.uv
          });
        });
        tempData.sort(function (a, b) {
          return a.uv > b.uv ? -1 : 1;
        })
        this.mapData = _.cloneDeep(tempData);
        this.renderGeoChart(type, tempData);
      }
      this.isSpinning.spin3 = false;
    })
  }
  //渲染地理图
  renderGeoChart(type, data) {
    this.dl_config = {
      type: 30,
      ext: {
        series: [{
          data: data,
          mapData: HC_map.maps['cn/china'],
          joinBy: ['fullname', 'name'],
          showInLegend: false,
          states: {
            hover: {
              color: '#BADA55'
            }
          },
          borderWidth: 1
        }]
      }
    };
  };

  //加载BS数据
  loadBsData(time, type) {
    this.isSpinning.spin4 = true;
    this.http.post("Monitor/BrowserStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderBsChart(type, d.Data);
      }
      this.isSpinning.spin4 = false;
    })
  }
  //渲染浏览器BS占比图
  renderBsChart(type, data) {
    let tempData = [];
    _.each(data, (val) => {
      tempData.push([val.bs, val.count]);
    });
    this.bs_config = {
      type: 20,
      ext: {
        series: [{
          type: 'pie',
          name: '浏览器访问量占比',
          data: tempData
        }]
      }
    };
  };

  //加载OS数据
  loadOsData(time, type) {
    this.isSpinning.spin5 = true;
    this.http.post("Monitor/OsStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderOsChart(type, d.Data);
      }
      this.isSpinning.spin5 = false;
    })
  }
  //渲染操作系统OS占比图
  renderOsChart(type, data) {
    let tempData = [];
    _.each(data, (val) => {
      tempData.push([val.os, val.count]);
    });
    this.os_config = {
      type: 20,
      ext: {
        series: [{
          type: 'pie',
          name: '浏览器访问量占比',
          data: tempData
        }]
      }
    };
  };

  //加载分辨率数据
  loadWhData(time, type) {
    this.isSpinning.spin6 = true;
    this.http.post("Monitor/PageWhStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderWhChart(type, d.Data);
      }
      this.isSpinning.spin6 = false;
    })
  }
  //渲染分辨率PV占比图
  renderWhChart(type, data) {
    let tempData = [];
    _.each(data, (val) => {
      tempData.push([val.pageWh, val.count]);
    });
    this.wh_config = {
      type: 20,
      ext: {
        series: [{
          type: 'pie',
          name: '浏览器访问量占比',
          data: tempData
        }]
      }
    };
  };


}
