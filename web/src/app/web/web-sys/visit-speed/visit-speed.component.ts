
import {fromEvent as observableFromEvent,  Observable } from 'rxjs';

import {debounceTime} from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Broadcaster } from './../../../monitor.common.service';
import { HttpClient } from '@angular/common/http';

import { Component, OnInit, ViewChildren, ElementRef, Renderer2 } from '@angular/core';


import * as HC_map from 'highcharts/highmaps';
import * as _ from 'lodash';
import { HighchartConfig } from '../../../model/entity';
declare var window: any
@Component({
  selector: 'app-visit-speed',
  templateUrl: './visit-speed.component.html',
  styleUrls: ['./visit-speed.component.scss']
})
export class VisitSpeedComponent implements OnInit {
  @ViewChildren('mydetailsContent') mydetailsContent: Array<ElementRef>
  unsubscribe = {
    sub0: null,
    sub1: null
  }
  key_perf_config: HighchartConfig
  area_perf_config: HighchartConfig
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
    spin9: true,
    spin10: true
  };
  appKey;
  keywords='';
  pageListData = [];
  mapData = [];
  page_load_data=[];
  bsData=[];
  osData=[];
  whData=[];
  currentSelectedPage
  constructor(
    private render: Renderer2,
    private http: HttpClient,
    private broadcaster: Broadcaster,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
   
    this.appKey = this.route.parent.snapshot.paramMap.get("appKey");
    this.unsubscribe.sub0 = observableFromEvent(window, "resize").pipe(
      debounceTime(100))
      .subscribe((event) => {
        this._resizePageHeight();
      });

    this.unsubscribe.sub1 = this.broadcaster.on("choiceTimeToRender").subscribe((data: any) => {
      this.loadPageList(data.time, data.type);
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
        this.loadKeyPerfData(data.time, data.type);
        this.loadAreaPerfData(data.time, data.type);
        break;
      case 20:
        this.loadPageLoadData(data.time, data.type);
        break;
      case 30:
        this.loadGeoData(data.time, data.type);
        break;
      case 40:
        this.loadBsData(data.time, data.type);
        this.loadOsData(data.time, data.type);
        this.loadWhData(data.time, data.type);
        break;
      default:
        break;
    }
  }

  search(){
    if (window.globalTime) {
      this.loadPageList(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadPageList(null, 4);
    }
  }

  //获取访问页面列表
  loadPageList(time, type) {
    this.isSpinning.spin1 = true;
    this.http.post("Monitor/PageSpeedStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords:this.keywords
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        if (d.Data && d.Data.length > 0) {
          d.Data[0]['select'] = true;
          this.pageListData = d.Data;
          this.selectPageListItem(d.Data[0]);
        }else{
          this.pageListData=[];
        }
        
      }
      this.isSpinning.spin1 = false;
    });
  }

  selectPageListItem(data) {
    _.each(this.pageListData, (val) => {
      val.select = false;
      val.avgLoad=val.avgLoad==0?0:parseInt(val.avgLoad);
    });
    data.select = true;
    this.currentSelectedPage = data.page;
    if (window.globalTime) {
      this.loadKeyPerfData(window.globalTime.time, window.globalTime.type);
      this.loadAreaPerfData(window.globalTime.time, window.globalTime.type);
      this.loadPageLoadData(window.globalTime.time, window.globalTime.type);

      this.loadGeoData(window.globalTime.time, window.globalTime.type);
      this.loadBsData(window.globalTime.time, window.globalTime.type);
      this.loadOsData(window.globalTime.time, window.globalTime.type);
      this.loadWhData(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadKeyPerfData(null, 4);
      this.loadAreaPerfData(null, 4);
      this.loadPageLoadData(null, 4);

      this.loadGeoData(null, 4);
      this.loadBsData(null, 4);
      this.loadOsData(null, 4);
      this.loadWhData(null, 4);
    }
  }


  //加载关键性能数据
  loadKeyPerfData(time, type) {
    this.isSpinning.spin2 = true;
    this.http.post("Monitor/KeyPerf", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      pageName:this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderKeyPerfChart(type, d.Data);
      }
      this.isSpinning.spin2 = false;
    })
  }

  //渲染关键性能对比图
  renderKeyPerfChart(type, data) {
    let tempData = {
      fpt: [],
      tti: [],
      ready: [],
      load: []
    };
    _.each(data, (val) => {
      tempData.fpt.push([new Date(val.createTime).getTime(), parseInt(val.fpt)]);
      tempData.tti.push([new Date(val.createTime).getTime(), parseInt(val.tti)]);
      tempData.ready.push([new Date(val.createTime).getTime(), parseInt(val.ready)]);
      tempData.load.push([new Date(val.createTime).getTime(), parseInt(val.load)]);
    });
    this.key_perf_config = {
      type: 10,
      extProps: {
        minTickIntervalType: type
      },
      ext: {
        series: [{
          name: '首次渲染时间',
          data: tempData.fpt,
          tooltip: {
            valueSuffix: 'ms'
          }
        }, {
          name: '首次可交互时间',
          data: tempData.tti,
          tooltip: {
            valueSuffix: 'ms'
          }
        }, {
          name: 'HTML加载完成',
          data: tempData.ready,
          tooltip: {
            valueSuffix: 'ms'
          }
        }, {
          name: '页面完全加载完成',
          data: tempData.load,
          tooltip: {
            valueSuffix: 'ms'
          }
        }]
      }
    };
  }


  //加载区间段耗时数据
  loadAreaPerfData(time, type) {
    this.isSpinning.spin3 = true;
    this.http.post("Monitor/ElapsedTime", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      pageName:this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderAreaPerfChart(type, d.Data);
      }
      this.isSpinning.spin3 = false;
    })
  }

  //渲染区间段耗时对比图
  renderAreaPerfChart(type, data) {
    let tempData = {
      dns: [],
      tcp: [],
      ttfb: [],
      trans: [],
      dom: [],
      res: []
    };
    _.each(data, (val) => {
      tempData.dns.push([new Date(val.createTime).getTime(), parseInt(val.dns)]);
      tempData.tcp.push([new Date(val.createTime).getTime(), parseInt(val.tcp)]);
      tempData.ttfb.push([new Date(val.createTime).getTime(), parseInt(val.ttfb)]);
      tempData.trans.push([new Date(val.createTime).getTime(), parseInt(val.trans)]);
      tempData.dom.push([new Date(val.createTime).getTime(), parseInt(val.dom)]);
      tempData.res.push([new Date(val.createTime).getTime(), parseInt(val.res)]);
    });
    this.area_perf_config = {
      type: 10,
      extProps: {
        minTickIntervalType: type
      },
      ext: {
        series: [{
          name: 'DNS查询',
          data: tempData.dns,
          tooltip: {
            valueSuffix: 'ms'
          }
        },{
          name: 'TCP连接',
          data: tempData.tcp,
          tooltip: {
            valueSuffix: 'ms'
          }
        },{
          name: '网络请求',
          data: tempData.ttfb,
          tooltip: {
            valueSuffix: 'ms'
          }
        },{
          name: '数据传输',
          data: tempData.trans,
          tooltip: {
            valueSuffix: 'ms'
          }
        },{
          name: 'DOM解析',
          data: tempData.dom,
          tooltip: {
            valueSuffix: 'ms'
          }
        },{
          name: '资源加载',
          data: tempData.res,
          tooltip: {
            valueSuffix: 'ms'
          }
        }]
      }
    };
  }

  //加载页面加载瀑布数据
  loadPageLoadData(time, type) {
    this.isSpinning.spin4 = true;
    this.http.post("Monitor/ElapsedTime", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      pageName:this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
       let temp=[
          {
            name: 'DNS查询',
            val: 0
          }, {
            name: 'TCP连接',
            val: 0
          }, {
            name: 'SSL 建连',
            val: 0
          }, {
            name: '请求响应',
            val: 0
          }, {
            name: '内容传输',
            val: 0
          }, {
            name: 'DOM解析',
            val: 0
          }, {
            name: '资源加载',
            val: 0
          }];
          _.each(d.Data, (val)=>{
            temp[0].val+=val.dns;
            temp[1].val+=val.tcp;
            temp[2].val+=val.ssl;
            temp[3].val+=val.ttfb;
            temp[4].val+=val.trans;
            temp[5].val+=val.dom;
            temp[6].val+=val.res;
          });
          _.each(temp, (val,index)=>{
            temp[index].val=parseInt((temp[index].val/d.Data.length).toString());
          });

          this.page_load_data=temp;
      }
      this.isSpinning.spin4 = false;
    })
  }


  //加载地理分布数据
  loadGeoData(time, type) {
    this.isSpinning.spin6 = true;
    this.http.post("Monitor/PerfGeo", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      pageName:this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        let tempData = [];
        _.each(d.Data, (val) => {
          tempData.push({
            name: val.provice,
            value:parseInt(val.fpt),
            fpt: parseInt(val.fpt)
          });
        });
        tempData.sort(function(a,b){
          return a.value>b.value?-1:1;
        })
        this.mapData = _.cloneDeep(tempData);
        this.renderGeoChart(type, tempData);
      }
      this.isSpinning.spin6 = false;
    })
  }
  //渲染地理图
  renderGeoChart(type, data) {
    this.dl_config = {
      type: 31,
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
    this.http.post("Monitor/TerminalSpeed", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      terminal:0,
      pageName:this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        _.each(d.Data, (val)=>{
          val.speed=parseInt(val.speed);
        })
        this.bsData=d.Data;
        this.bsData.sort(function(a,b){
          return a.speed>b.speed?-1:1;
        })
      }
     
      this.isSpinning.spin7 = false;
    })
  }

  //加载OS数据
  loadOsData(time, type) {
    this.isSpinning.spin8 = true;
    this.http.post("Monitor/TerminalSpeed", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      terminal:1,
      pageName:this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        _.each(d.Data, (val)=>{
          val.speed=parseInt(val.speed);
        })
        this.osData=d.Data;
        this.osData.sort(function(a,b){
          return a.speed>b.speed?-1:1;
        })
      }
      this.isSpinning.spin8 = false;
    })
  }
 
  //加载分辨率数据
  loadWhData(time, type) {
    this.isSpinning.spin9 = true;
    this.http.post("Monitor/TerminalSpeed", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      terminal:2,
      pageName:this.currentSelectedPage
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        _.each(d.Data, (val)=>{
          val.speed=parseInt(val.speed);
        })
        this.whData=d.Data;
        this.whData.sort(function(a,b){
          return a.speed>b.speed?-1:1;
        })
      }
      this.isSpinning.spin9 = false;
    })
  }

  ngAfterViewInit() {
    this.broadcaster.broadcast('showGlobalTimer',true);
    this._resizePageHeight();
  }
  ngOnDestroy(): void {
    this.unsubscribe.sub0.unsubscribe();
    this.unsubscribe.sub1.unsubscribe();
  }

  private _resizePageHeight() {
    this.mydetailsContent.forEach(element => {
      this.render.setStyle(element.nativeElement, "height", window.innerHeight - 50 - 70 + "px");
    });

  }

}

