import { fromEvent as observableFromEvent, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Broadcaster } from './../../../monitor.common.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChildren, ElementRef, Renderer2 } from '@angular/core';
import * as HC_map from 'highcharts/highmaps';
import * as Highcharts from 'highcharts';
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
  js_config: HighchartConfig
  api_config: HighchartConfig
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

  selectOver(data, type) {
    switch (type) {
      case 10:
        this.loadVisitSpeedData(data.time, data.type);
        break;
      case 20:
        this.loadJsData(data.time, data.type);
        break;
      case 30:
        this.loadApiSuccRateData(data.time, data.type);
        break;
      default:
        break;
    }
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
        } else {
          this.geoListData = [];
        }

      }
      this.isSpinning.spin1 = false;
    });
  }

  selectGeoListItem(data) {
    _.each(this.geoListData, (val) => {
      val.select = false;
    });
    data.select = true;
    this.currentSelectedGeo = data.geo;
    if (window.globalTime) {
      this.loadVisitSpeedData(window.globalTime.time, window.globalTime.type);
      this.loadJsData(window.globalTime.time, window.globalTime.type);
      this.loadApiSuccRateData(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadVisitSpeedData(null, 4);
      this.loadJsData(null, 4);
      this.loadApiSuccRateData(null, 4);
    }
  }


  //加载关键性能数据
  loadVisitSpeedData(time, type) {
    this.isSpinning.spin2 = true;
    this.http.post("Monitor/VisitSpeedStatic", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.currentSelectedGeo,
      kerfType: 2
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderVisitSpeedChart(type, d.Data);
      }
      this.isSpinning.spin2 = false;
    })
  }

  //渲染关键性能柱状图
  renderVisitSpeedChart(type, data) {
    let tempData = {
      fpt: [],
      // tti: [],
      ready: [],
      load: []
    };
    _.each(data, (val) => {
      tempData.fpt.push([new Date(val.createTime).getTime(), parseInt(val.fpt)]);
      // tempData.tti.push([new Date(val.createTime).getTime(), parseInt(val.tti)]);
      tempData.ready.push([new Date(val.createTime).getTime(), parseInt(val.ready)]);
      tempData.load.push([new Date(val.createTime).getTime(), parseInt(val.load)]);
    });
    this.key_perf_config = {
      type: 50,
      extProps: {
        minTickIntervalType: type
      },
      ext: {
        yAxis: {
          title: {
            text: '耗时(ms)'
          }
        },
        series: [{
          name: '首次渲染',
          data: tempData.fpt,
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
          name: '页面完全加载',
          data: tempData.load,
          tooltip: {
            valueSuffix: 'ms'
          }
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
      keywords: this.currentSelectedGeo,
      errorRateType: 2
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
      tempData.jsErr.push([new Date(val.createTime).getTime(), parseFloat((val.errorRate * 100).toFixed(2))]);
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
          min: 0,
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


  //加载API成功率数据
  loadApiSuccRateData(time, type) {
    this.isSpinning.spin4 = true;
    this.http.post("Monitor/ApiSuccRateStatic", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.currentSelectedGeo,
      apiSuccRateType: 2
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderApiSuccRateChart(d.Data);
      }
      this.isSpinning.spin4 = false;
    })
  }

  // 渲染API 成功率
  renderApiSuccRateChart(data) {
    let tempData = {
      times: [],
      succRate: []
    };
    _.each(data, (val) => {
      tempData.times.push([new Date(val.createTime).getTime(), val.times]);
      tempData.succRate.push([new Date(val.createTime).getTime(), parseFloat((val.succRate * 100).toFixed(2))]);
    });
    this.api_config = {
      type: 40,
      ext: {
        yAxis: [{ // Primary yAxis
          labels: {
            format: '{value}%',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          },
          min: 0,
          max: 100,
          title: {
            text: "成功率",
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          }
        }, { // Secondary yAxis
          title: {
            text: '调用次数',
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
        }],
        series: [{
          name: '调用次数',
          type: 'column',
          yAxis: 1,
          data: tempData.times,
          tooltip: {
            valueSuffix: ''
          }
        }, {
          name: '成功率',
          type: 'spline',
          data: tempData.succRate,
          tooltip: {
            valueSuffix: '%'
          }
        }]
      }
    };
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






