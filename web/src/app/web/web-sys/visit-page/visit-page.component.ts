
import {fromEvent as observableFromEvent,  Observable } from 'rxjs';

import {debounceTime} from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Broadcaster } from './../../../monitor.common.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChildren, ElementRef, Renderer2 } from '@angular/core';


import * as HC_map from 'highcharts/highmaps';
import * as _ from 'lodash';
import { HighchartConfig } from '../../../model/entity';
declare var window: any
import * as Highcharts from 'highcharts';
@Component({
  selector: 'app-visit-page',
  templateUrl: './visit-page.component.html',
  styleUrls: ['./visit-page.component.scss']
})
export class VisitPageComponent implements OnInit {
  @ViewChildren('mydetailsContent') mydetailsContent: Array<ElementRef>
  unsubscribe = {
    sub0: null,
    sub1: null
  };
  pv_uv_config: HighchartConfig
  js_config: HighchartConfig
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
    spin6: true,
    spin7: true,
    spin8: true,
    spin9: true
  };
  appKey;
  pageListData;
  mapData = [];
  JsData = [];
  apiData = [];
  keywords = '';
  pageIndex=1;
  pageSize=50;
  currentSelectedPage
  JsGroupData = [];
  constructor(
    private render: Renderer2,
    private http: HttpClient,
    private broadcaster: Broadcaster,
    private route: ActivatedRoute,
    private router:Router
  ) { }

  ngOnInit() {
    
    this.appKey = this.route.parent.snapshot.paramMap.get("appKey");
    this.unsubscribe.sub0 = observableFromEvent(window, "resize").pipe(
      debounceTime(100))
      .subscribe((event) => {
        this._resizePageHeight();
      });
    this.unsubscribe.sub1 = this.broadcaster.on("choiceTimeToRender").subscribe((data: any) => {

      this.search();
    });
    if (window.globalTime) {
      this.loadPageList(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadPageList(null, 4);
    }
  }
  selectOver(data, type) {
    switch (type) {
      case 10:
        this.loadPvUvData(data.time, data.type);
        break;
      case 20:
        this.loadJsData(data.time, data.type);
        break;
      case 30:
        this.loadJsGroupData(data.time, data.type);
        break;
      case 40:
        this.loadApiData(data.time, data.type);
        break;
      case 50:
        this.loadGeoData(data.time, data.type);
      case 60:
        this.loadBsData(data.time, data.type);
        this.loadOsData(data.time, data.type);
        this.loadWhData(data.time, data.type);
        break;
      default:
        break;
    }
  }

  search() {
    if (window.globalTime) {
      this.loadPageList(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadPageList(null, 4);
    }
  }

  
  //加载更多
  loadMore() {
    let time;
    let type;
    if (window.globalTime) {
      time=window.globalTime.time;
      type=window.globalTime.type;
    } else {
      time=null;
      type=4;
    }
    this.isSpinning.spin1 = true;
    this.pageIndex+=1;
    this.http.post("Monitor/PageRankStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.keywords,
      pageIndex:this.pageIndex,
      pageSize:this.pageSize
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        if (d.Data && d.Data.pageStatis.length > 0) {
          _.each(d.Data.pageStatis, (val) => {
            val.select = false;
            val.percent = new Number((val.count / this.pageListData.totalCount) * 100).toFixed(2);
          });
          this.pageListData.pageStatis =[...this.pageListData.pageStatis, ...d.Data.pageStatis];
        }
      }
      this.isSpinning.spin1 = false;
    });
  }

  //获取访问页面列表
  loadPageList(time, type) {
    this.isSpinning.spin1 = true;
    this.pageIndex=1;
    this.http.post("Monitor/PageRankStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.keywords,
      pageIndex:this.pageIndex,
      pageSize:this.pageSize
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        if (d.Data && d.Data.pageStatis.length > 0) {
          d.Data.pageStatis[0]['select'] = true;
          this.pageListData = d.Data;
          _.each(this.pageListData.pageStatis, (val) => {
            val.select = false;
            val.percent = new Number((val.count / this.pageListData.totalCount) * 100).toFixed(2);
          });
          this.selectPageListItem(d.Data.pageStatis[0]);
        }else{
          this.pageListData = null;
        }
      }
      this.isSpinning.spin1 = false;
    });
  }

  selectPageListItem(data) {
    _.each(this.pageListData.pageStatis, (val) => {
      val.select = false;
    });
    data.select = true;
    this.currentSelectedPage = data.page;
    if (window.globalTime) {
      this.loadPvUvData(window.globalTime.time, window.globalTime.type);
      this.loadJsData(window.globalTime.time, window.globalTime.type);
      this.loadJsGroupData(window.globalTime.time, window.globalTime.type);
      this.loadApiData(window.globalTime.time, window.globalTime.type);
      this.loadGeoData(window.globalTime.time, window.globalTime.type);
      this.loadBsData(window.globalTime.time, window.globalTime.type);
      this.loadOsData(window.globalTime.time, window.globalTime.type);
      this.loadWhData(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadPvUvData(null, 4);
      this.loadJsData(null, 4);
      this.loadJsGroupData(null, 4);
      this.loadApiData(null, 4);
      this.loadGeoData(null, 4);
      this.loadBsData(null, 4);
      this.loadOsData(null, 4);
      this.loadWhData(null, 4);
    }
  }

  //加载PV/UV数据
  loadPvUvData(time, type) {
    this.isSpinning.spin2 = true;
    this.http.post("Monitor/PvAndUvStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderPvUvChart(type, d.Data);
      }
      this.isSpinning.spin2 = false;
    })
  }

  //渲染PV/UV对比图
  renderPvUvChart(type, data) {
    let tempData = {
      pv: [],
      uv: []
    };
    _.each(data.pvAndUvVmList, (val) => {
      tempData.pv.push([new Date(val.createTime).getTime(), val.pv]);
      tempData.uv.push([new Date(val.createTime).getTime(), val.uv]);
    });
    tempData.pv.sort();
    tempData.uv.sort();
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

  //加载JS错误率数据
  loadJsData(time, type) {
    this.isSpinning.spin3 = true;
    this.http.post("Monitor/JsErrorRate", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.currentSelectedPage,
      errorRateType:1
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderJsChart(type, d.Data);
      }
      this.isSpinning.spin3 = false;
    })
  }

  //渲染js/pv对比图
  renderJsChart(type, data) {

    let tempData = {
      pv: [],
      jsErr: []
    };
    _.each(data.errorStatis, (val) => {
      tempData.pv.push([new Date(val.createTime).getTime(), val.pv]);
      tempData.jsErr.push([new Date(val.createTime).getTime(), parseFloat((val.errorRate*100).toFixed(2))]);
    });
    this.js_config = {
      type: 40,
      ext: {
        series: [{
          name: 'PV',
          type: 'column',
          yAxis: 1,
          data: tempData.pv
        }, {
          name: '错误率',
          type: 'spline',
          data: tempData.jsErr,
          tooltip: {
            valueSuffix: '%'
          }
        }],
        yAxis: [{ // Primary yAxis
          labels: {
            format: '{value}%',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          },
          min:0,
          title: {
            text: '错误率',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          }
        }, { // Secondary yAxis
          title: {
            text: 'PV',
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
          labels: {
            format: '{value}',
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
          opposite: true
        }]
      }
    };
  }


  //加载JS错误聚类数据
  loadJsGroupData(time, type) {
    this.isSpinning.spin4 = true;
    this.http.post("Monitor/JsAggregate", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        _.each(d.Data, (d)=>{
          d.msg=decodeURIComponent(d.msg);
        });
        this.JsGroupData = d.Data;
      }
      this.isSpinning.spin4 = false;
    });
  }

  //加载api详情数据
  loadApiData(time, type) {
    this.isSpinning.spin5 = true;
    this.http.post("Monitor/ApiCase", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords:this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        _.each(d.Data, (val)=>{
          val.avgTime=val.avgTime==0?0:parseInt(val.avgTime);
        }); 
        this.apiData = d.Data;
      }
      this.isSpinning.spin5 = false;
    })
  }

  //加载地理分布数据
  loadGeoData(time, type) {
    this.isSpinning.spin6 = true;
    this.http.post("Monitor/AddressMap", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords:this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        let tempData = [];
        _.each(d.Data, (val) => {
          tempData.push({
            name: val.provice,
            value:val.pv,
            pv: val.pv
          });
        });
        this.mapData = _.cloneDeep(tempData);
        this.renderGeoChart(type, tempData);
      }
      this.isSpinning.spin6 = false;
    })
  }
  //渲染地理图
  renderGeoChart(type, data) {
    this.dl_config = {
      type: 36,
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
    this.isSpinning.spin7 = true;
    this.http.post("Monitor/TerminalStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      terminal: 0,
      pageName: this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderBsChart(type, d.Data);
      }
      this.isSpinning.spin7 = false;
    })
  }
  //渲染浏览器BS占比图
  renderBsChart(type, data) {
    let tempData = [];
    _.each(data, (val) => {
      tempData.push([val.terminal, val.pvCount]);
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
    this.isSpinning.spin8 = true;
    this.http.post("Monitor/TerminalStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      terminal: 1,
      pageName: this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderOsChart(type, d.Data);
      }
      this.isSpinning.spin8 = false;
    })
  }
  //渲染操作系统OS占比图
  renderOsChart(type, data) {
    let tempData = [];
    _.each(data, (val) => {
      tempData.push([val.terminal, val.pvCount]);
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
    this.isSpinning.spin9 = true;
    this.http.post("Monitor/TerminalStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      terminal: 2,
      pageName: this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderWhChart(type, d.Data);
      }
      this.isSpinning.spin9 = false;
    })
  }
  //渲染分辨率PV占比图
  renderWhChart(type, data) {
    let tempData = [];
    _.each(data, (val) => {
      tempData.push([val.terminal, val.pvCount]);
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

  gotoDetails(data,data2){
    this.router.navigate([`../visitDetails`],{queryParams:{sTime:data2.createTime,keywords:encodeURIComponent(data.apiName),type:'api'},relativeTo:this.route});
  }

  ngAfterViewInit() {
    this.broadcaster.broadcast('showGlobalTimer',true);
    this._resizePageHeight();
  }
  ngOnDestroy(): void {
    this.unsubscribe.sub0.unsubscribe();
  }

  private _resizePageHeight() {
    this.mydetailsContent.forEach(element => {
      this.render.setStyle(element.nativeElement, "height", window.innerHeight - 50 - 70 + "px");
    });

  }

}
