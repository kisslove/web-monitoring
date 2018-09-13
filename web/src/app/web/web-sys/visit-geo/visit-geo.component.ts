


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
  selector: 'app-visit-geo',
  templateUrl: './visit-geo.component.html',
  styleUrls: ['./visit-geo.component.scss']
})
export class VisitGeoComponent implements OnInit {
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
    spin4: true
  };
  appKey;
  geoListData = [];
  currentSelectedGeo
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
      this.loadGeoList(data.time, data.type);
    });
    if (window.globalTime) {
      this.loadGeoList(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadGeoList(null, 4);
    }

  }

  selectOver(data) {
    this.loadVisitSpeedData(data.time, data.type);
    this.loadAreaPerfData(data.time, data.type);
    this.loadPageLoadData(data.time, data.type);
  }

  //获取地理列表
  loadGeoList(time, type) {
    this.isSpinning.spin1 = true;
    this.http.post("Monitor/GeoListStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        if (d.Data && d.Data.length > 0) {
          d.Data[0]['select'] = true;
          this.geoListData = d.Data;
          this.selectGeoListItem(d.Data[0]);
        }else{
          this.geoListData=[];
        }
        
      }
      this.isSpinning.spin1 = false;
    });
  }

  selectGeoListItem(data) {
    data.select = true;
    this.currentSelectedGeo = data.page;
    if (window.globalTime) {
      this.loadVisitSpeedData(window.globalTime.time, window.globalTime.type);
      this.loadAreaPerfData(window.globalTime.time, window.globalTime.type);
      this.loadPageLoadData(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadVisitSpeedData(null, 4);
      this.loadAreaPerfData(null, 4);
      this.loadPageLoadData(null, 4);
    }
  }


  //加载访问速度数据
  loadVisitSpeedData(time, type) {
    this.isSpinning.spin2 = true;
    this.http.post("Monitor/geoVisitSpeed", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      geoName:this.currentSelectedGeo
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderVisitSpeedChart(type, d.Data);
      }
      this.isSpinning.spin2 = false;
    })
  }

  //渲染关键性能对比图
  renderVisitSpeedChart(type, data) {
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
      geoName:this.currentSelectedGeo
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
      geoName:this.currentSelectedGeo
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

          // this.page_load_data=temp;
      }
      this.isSpinning.spin4 = false;
    })
  }


  ngAfterViewInit() {
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






