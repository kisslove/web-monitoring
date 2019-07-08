
import {fromEvent as observableFromEvent,  Observable } from 'rxjs';

import {debounceTime} from 'rxjs/operators';
import { slideInDownAnimation } from './../../../animations';

import { ActivatedRoute } from '@angular/router';
import { Broadcaster } from './../../../monitor.common.service';
import { HttpClient } from '@angular/common/http';

import { Component, OnInit, ViewChildren, ElementRef, Renderer2 } from '@angular/core';


import * as HC_map from 'highcharts/highmaps';
import * as _ from 'lodash';
import { HighchartConfig } from '../../../model/entity';
import * as Highcharts from 'highcharts';
declare var window: any
@Component({
  selector: 'app-api-request',
  templateUrl: './api-request.component.html',
  styleUrls: ['./api-request.component.scss'],
  animations: [slideInDownAnimation]
}) 
export class ApiRequestComponent implements OnInit {
  @ViewChildren('mydetailsContent') mydetailsContent: Array<ElementRef>
  unsubscribe = {
    sub0: null,
    sub1: null
  };
  dl_config: HighchartConfig
  first_config: HighchartConfig
  isSpinning = {
    spin1: true,
    spin2: true,
    spin3: true,
    spin4: true,
    spin5: true,
    spin6: true,
    spin7: true
  };
  appKey;
  keywords = '';
  pageIndex=1;
  pageSize=50;
  apiListData = {
    data:[],
    total:0
  };
  apiReqListData = [];
  mapData = [];
  bsData = [];
  osData = [];
  whData = [];
  currentSelectedApi
  currentSelectedTab = 0;
  currentSelected_first_title = "API 成功率";
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
      this.loadApiList(data.time, data.type);
    });
    if (window.globalTime) {
      this.loadApiList(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadApiList(null, 4);
    }
  }

  selectOver(data, type) {
    switch (type) {
      case 10:
        if (this.currentSelectedTab == 1) {
          this.loadMsgApiDetailsData(data.time, data.type);
        } else {
          this.firstPanelChartData(data.time, data.type);
        }
        break;
      case 20:
        this.loadGeoData(data.time, data.type);
        break;
      case 30:
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
      this.loadApiList(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadApiList(null, 4);
    }
  }


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
    this.http.post("Monitor/ApiStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.keywords,
      typeEnum: this.currentSelectedTab,
      pageIndex:this.pageIndex,
      pageSize:this.pageSize
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        if (d.Data && d.Data.data.length > 0) {
          this.apiListData.data = [...this.apiListData.data,...d.Data.data];
        }
      }
      this.isSpinning.spin1 = false;
    });
  }

  //获取API列表
  loadApiList(time, type) {
    this.isSpinning.spin1 = true;
    this.pageIndex=1;
    this.http.post("Monitor/ApiStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.keywords,
      typeEnum: this.currentSelectedTab,
      pageIndex:this.pageIndex,
      pageSize:this.pageSize
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        if (d.Data && d.Data.data.length > 0) {
          d.Data.data[0]['select'] = true;
          this.apiListData = d.Data;
          this.selectApiListItem(d.Data.data[0]);
        } else {
          this.apiListData.data = [];
          this.apiListData.total = 0;
        }
      }
      this.isSpinning.spin1 = false;
    });
  }

  selectApiListItem(data) {
    _.each(this.apiListData.data, (val) => {
      val.select = false;
      val.result = val.result == 0 ? 0 : val.result;
    });
    data.select = true;
    this.currentSelectedApi = data.name;
    if (window.globalTime) {
      if (this.currentSelectedTab == 1) {
        this.loadMsgApiDetailsData(window.globalTime.time, window.globalTime.type);
      } else {
        this.firstPanelChartData(window.globalTime.time, window.globalTime.type);
      }

      this.loadGeoData(window.globalTime.time, window.globalTime.type);
      this.loadBsData(window.globalTime.time, window.globalTime.type);
      this.loadOsData(window.globalTime.time, window.globalTime.type);
      this.loadWhData(window.globalTime.time, window.globalTime.type);
    } else {
      if (this.currentSelectedTab == 1) {
        this.loadMsgApiDetailsData(null, 4);
      } else {
        this.firstPanelChartData(null, 4);
      }
      this.loadGeoData(null, 4);
      this.loadBsData(null, 4);
      this.loadOsData(null, 4);
      this.loadWhData(null, 4);
    }
  }

  //加载Msg 调用详情数据
  loadMsgApiDetailsData(time, type) {
    this.isSpinning.spin2 = true;
    this.http.post("Monitor/MsgCallDetails", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      msg: this.currentSelectedApi
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.apiReqListData = d.Data;
      }
      this.isSpinning.spin2 = false;
    })
  }

  //加载Msg 调用详情数据
  firstPanelChartData(time, type) {
    this.isSpinning.spin2 = true;
    let url = "";
    let isSucc = false;
    switch (this.currentSelectedTab) {
      case 0:
        url = "Monitor/ApiSuccRate";
        break;
      case 2:
        url = "Monitor/SuccOrFailTimes";
        isSucc = true;
        break;
      case 3:
        url = "Monitor/SuccOrFailTimes";
        isSucc = false;
        break;
      default:
        break;
    }
    this.http.post(url, {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      apiName: this.currentSelectedApi,
      isSucc: isSucc
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        switch (this.currentSelectedTab) {
          case 0:
            this.renderChart1(d.Data);
            break;
          case 2:
            this.renderChart2(d.Data);
            break;
          case 3:
            this.renderChart3(d.Data);
            break;
          default:
            break;
        }
        // 
      }
      this.isSpinning.spin2 = false;
    })
  }
  // API 成功率
  renderChart1(data) {
    let tempData = {
      times: [],
      succRate: []
    };
    _.each(data, (val) => {
      tempData.times.push([new Date(val.createTime).getTime(), val.times]);
      tempData.succRate.push([new Date(val.createTime).getTime(), parseFloat((val.succRate * 100).toFixed(2))]);
    });
    this.first_config = {
      type: 40,
      ext: {
        // chart: {
        //   zoomType: 'xy'
        // },
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

  // API 成功耗时
  renderChart2(data) {
    let tempData = {
      count: [],
      avgTime: []
    };
    _.each(data, (val) => {
      tempData.count.push([new Date(val.createTime).getTime(), val.count]);
      tempData.avgTime.push([new Date(val.createTime).getTime(), parseFloat((val.avgTime / 1000).toFixed(3))]);
    });
    this.first_config = {
      type: 40,
      ext: {
        yAxis: [{ // Primary yAxis
          labels: {
            format: '{value}s',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          },
          title: {
            text: "平均成功耗时",
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          }
        }, { // Secondary yAxis
          title: {
            text: '调用成功次数',
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
          min: 0,
          allowDecimals: false,
          labels: {
            format: '{value}',
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
          opposite: true
        }],
        series: [{
          name: '调用成功次数',
          type: 'column',
          yAxis: 1,
          data: tempData.count,
          tooltip: {
            valueSuffix: ''
          }
        }, {
          name: '平均成功耗时',
          type: 'spline',
          data: tempData.avgTime,
          tooltip: {
            valueSuffix: 's'
          }
        }]
      }
    };
  }

  // API 失败耗时
  renderChart3(data) {
    let tempData = {
      count: [],
      avgTime: []
    };
    _.each(data, (val) => {
      tempData.count.push([new Date(val.createTime).getTime(), val.count]);
      tempData.avgTime.push([new Date(val.createTime).getTime(), parseFloat((val.avgTime / 1000).toFixed(3))]);
    });
    this.first_config = {
      type: 40,
      ext: {
        yAxis: [{ // Primary yAxis
          labels: {
            format: '{value}s',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          },
          title: {
            text: "平均失败耗时",
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          }
        }, { // Secondary yAxis
          title: {
            text: '调用失败次数',
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
          min: 0,
          allowDecimals: false,
          labels: {
            format: '{value}',
            style: {
              color: Highcharts.getOptions().colors[0]
            }
          },
          opposite: true
        }],
        series: [{
          name: '调用失败次数',
          type: 'column',
          yAxis: 1,
          data: tempData.count,
          tooltip: {
            valueSuffix: ''
          }
        }, {
          name: '平均失败耗时',
          type: 'spline',
          data: tempData.avgTime,
          tooltip: {
            valueSuffix: 's'
          }
        }]
      }
    };
  }

  //加载地理分布数据
  loadGeoData(time, type) {
    this.isSpinning.spin3 = true;
    let url = '';
    let isSucc;
    switch (this.currentSelectedTab) {
      case 0:
        url = "Monitor/SuccRateGeo";
        break;
      case 1:
        url = "Monitor/MsgGeo";
        break;
      case 2:
        url = "Monitor/ElapsedTimeGeo";
        isSucc = true;
        break;
      case 3:
        url = "Monitor/ElapsedTimeGeo";
        isSucc = false;
        break;
      default:
        break;
    }
    this.http.post(url, {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      apiName: this.currentSelectedApi,
      msg: this.currentSelectedApi,
      isSucc: isSucc
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        let tempData = [];
        let type;
        if (this.currentSelectedTab == 0) {
          type = 32;
          _.each(d.Data, (val) => {
            tempData.push({
              name: val.provice,
              succRate: parseFloat((val.succRate * 100).toFixed(2)),
              value: parseFloat((val.succRate * 100).toFixed(2)),
              times: val.times
            });
          });
        }
        if (this.currentSelectedTab == 1) {
          type = 33;
          _.each(d.Data, (val) => {
            tempData.push({
              name: val.provice,
              value: val.times,
              times: val.times
            });
          });
        }
        if (this.currentSelectedTab == 2) {
          type = 34;
          _.each(d.Data, (val) => {
            tempData.push({
              name: val.provice,
              avgTime: parseFloat((val.avgTime / 1000).toFixed(2)),
              value: parseFloat((val.avgTime / 1000).toFixed(2)),
              times: val.times
            });
          });
        }
        if (this.currentSelectedTab == 3) {
          type = 35;
          _.each(d.Data, (val) => {
            tempData.push({
              name: val.provice,
              avgTime: parseFloat((val.avgTime / 1000).toFixed(2)),
              value: parseFloat((val.avgTime / 1000).toFixed(2)),
              times: val.times
            });
          });
        }
        this.mapData = _.cloneDeep(tempData);
        this.renderGeoChart(tempData, type);
      }
      this.isSpinning.spin3 = false;
    })
  }
  //渲染地理图
  renderGeoChart(data, type) {
    this.dl_config = {
      type: type,
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
    let url = "";
    let isSucc;
    switch (this.currentSelectedTab) {
      case 0:
        url = "Monitor/SuccTerminal";
        break;
      case 1:
        url = "Monitor/MsgTerminal";
        break;
      case 2:
        url = "Monitor/ElapsedTimeTerminal";
        isSucc = true;
        break;
      case 3:
        url = "Monitor/ElapsedTimeTerminal";
        isSucc = false;
        break;
      default:
        break;
    }
    this.http.post(url, {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      terminal: 0,
      apiName: this.currentSelectedApi,
      msg: this.currentSelectedApi,
      isSucc: isSucc
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.bsData = d.Data;
      }
      this.isSpinning.spin4 = false;
    })
  }

  //加载OS数据
  loadOsData(time, type) {
    this.isSpinning.spin5 = true;
    let url = "";
    let isSucc;
    switch (this.currentSelectedTab) {
      case 0:
        url = "Monitor/SuccTerminal";
        break;
      case 1:
        url = "Monitor/MsgTerminal";
        break;
      case 2:
        url = "Monitor/ElapsedTimeTerminal";
        isSucc = true;
        break;
      case 3:
        url = "Monitor/ElapsedTimeTerminal";
        isSucc = false;
        break;
      default:
        break;
    }
    this.http.post(url, {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      terminal: 1,
      apiName: this.currentSelectedApi,
      msg: this.currentSelectedApi,
      isSucc: isSucc
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.osData = d.Data;
      }
      this.isSpinning.spin5 = false;
    })
  }

  //加载分辨率数据
  loadWhData(time, type) {
    this.isSpinning.spin6 = true;
    let url = "";
    let isSucc;
    switch (this.currentSelectedTab) {
      case 0:
        url = "Monitor/SuccTerminal";
        break;
      case 1:
        url = "Monitor/MsgTerminal";
        break;
      case 2:
        url = "Monitor/ElapsedTimeTerminal";
        isSucc = true;
        break;
      case 3:
        url = "Monitor/ElapsedTimeTerminal";
        isSucc = false;
        break;
      default:
        break;
    }
    this.http.post(url, {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      terminal: 2,
      apiName: this.currentSelectedApi,
      msg: this.currentSelectedApi,
      isSucc: isSucc
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.whData = d.Data;
      }
      this.isSpinning.spin6 = false;
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

  nzSelectedIndexChange(d) {
    switch (d) {
      case 0:
        this.currentSelected_first_title = "API 成功率";
        break;
      case 1:
        this.currentSelected_first_title = "Msg 调用详情";
        break;
      case 2:
        this.currentSelected_first_title = "API成功耗时";
        break;
      case 3:
        this.currentSelected_first_title = "API失败耗时";
        break;
      default:
        break;
    }
    this.currentSelectedTab = d;
    this.search()
  }

  private _resizePageHeight() {
    this.mydetailsContent.forEach(element => {
      this.render.setStyle(element.nativeElement, "height", window.innerHeight - 50 - 70 + "px");
    });

  }

}



