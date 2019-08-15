declare var require: any;
import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import * as HC_map from 'highcharts/highmaps';
require('../../../../extraJs/china')(HC_map);
require('highcharts/highcharts-3d.js')(Highcharts);
import { HighchartConfig } from '../../model/entity';
import * as _ from 'lodash';
(function (a) { a(Highcharts) })(function (a) { a.theme = { colors: ["#FDD089", "#FF7F79", "#A0446E", "#251535"], colorAxis: { maxColor: "#60042E", minColor: "#FDD089" }, plotOptions: { map: { nullColor: "#fefefc" } }, navigator: { series: { color: "#FF7F79", lineColor: "#A0446E" } } }; a.setOptions(a.theme) });
@Component({
  selector: 'app-custom-highchart',
  templateUrl: './custom-highchart.component.html',
  styleUrls: ['./custom-highchart.component.scss']
})
export class CustomHighchartComponent implements OnInit {
  @Input('config') highConfig: HighchartConfig
  containerId;
  timeOutFlag;
  globalColors = [
    '#F0574D', '#C55661', '#9A6686', '#866F99', '#D48E4A', '#BC8D58', '#908D74', '#588D99', '#378DAE', '#3ADDFA', '#46C4D9', '#AB8173', '#C3715A', '#EF5630', '#716ded', '#4b7696', '#4b968a', '#69bf8c', '#7abf69', '#aebf69', '#bf9d69', '#bf6969', '#bf699d', '#ae69bf', '#7a69bf', '#698cbf', '#69bfbf', '#6ccc6f', '#a2cc6c', '#ccbc6c', '#cc826c', '#cc6cc9', '#966ccc', '#32CD32', '#6c7ccc', '#6cb6cc', '#6ccca9'
  ];
  constructor() {
    this.containerId = 'highchart_' + Math.random();
  }
  ngOnInit() {
    Highcharts.setOptions({
      global: {
        timezoneOffset: -8 * 60
      }
    });
  }

  ngOnChanges(changes) {
    if (changes.highConfig.currentValue && changes.highConfig.currentValue != changes.highConfig.previousValue) {
      this.timeOutFlag = setTimeout(() => {
        if (!this.containerId)
          return;
        switch (this.highConfig.type) {
          case 10://对比双曲线
            this.renderCompareSplineChart()
            break;
          case 20://饼图
            this.renderPieChart()
            break;
          case 30://地图(pv/uv)
            this.renderMapChart(this.highConfig.type)
          case 31://地图(api调用)
            this.renderMapChart(this.highConfig.type)
          case 32://地图(api调用)
            this.renderMapChart(this.highConfig.type)
          case 33://地图(api调用)
            this.renderMapChart(this.highConfig.type)
          case 34://地图(api调用)
            this.renderMapChart(this.highConfig.type)
          case 35://地图(api调用)
            this.renderMapChart(this.highConfig.type)
          case 36://地图(pv)
            this.renderMapChart(this.highConfig.type)
            break;
          case 40://曲线图和柱状图
            this.renderColumnAndSplineChart()
            break;
          case 50://柱状图
            this.renderColumnChart()
            break;
          default:
            break;
        }
      });
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutFlag);
    this.containerId = null;
  }

  private renderCompareSplineChart() {
    Highcharts.chart(this.containerId, _.extend({}, {
      credits: {
        enabled: false
      },
      chart: {
        type: 'column',
        height: 280,
        options3d: {
          enabled: true,
          depth: 50
        }
      },
      title: {
        text: null
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom'
      },
      xAxis: { 
        tickWidth: 0,
        type: 'datetime',
        dateTimeLabelFormats: {
          // millisecond: '%H:%M',
          // second: '%H:%M',
          minute: '%H:%M',
          hour: '%H:%M',
          day: '%m-%d',
          week: '%m-%d',
          month: '%Y-%m',
          year: '%Y'
        }
      },
      yAxis: {
        min: 0,
        minorGridLineWidth: 0,
        gridLineWidth: 0,
        alternateGridColor: null,
        title: {
          text: null
        }
      },
      tooltip: {
        crosshairs: true,
        shared: true,
        dateTimeLabelFormats: {
          minute: '%m-%d %H:%M',
          hour: '%m-%d %H:%M',
          day: '%m-%d',
          week: '%m-%d',
          month: '%Y-%m',
          year: '%Y'
        }
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: false
          }
        }
      }
    }, this.highConfig.ext));
  }

  private renderPieChart() {
    Highcharts.chart(this.containerId, _.extend({}, {
      credits: {
        enabled: false
      },
      legend: {
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
      },
      chart: {
        type: 'pie',
        height: 200,
        options3d: {
          enabled: true,
          alpha: 45,
          beta: 0
        }
      },
      title: {
        text: null
      },
      tooltip: {
        // headerFormat: '{point.name}<br>',
        pointFormat: '数量: <b>{point.y}</b><br/>占比: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          colors: this.globalColors,
          cursor: 'pointer',
          depth: 35,
          dataLabels: {
            enabled: false
          },
          showInLegend: true // 设置饼图是否在图例中显示
        }
      }
    }, this.highConfig.ext));
  }

  private renderMapChart(mapType) {
    HC_map.mapChart(this.containerId, _.extend({}, {
      credits: {
        enabled: false,
        text: '',
        style: {
          color: 'rgba(255, 255, 255, 0.6)'
        },
        position: {
          y: -40
        }
      },
      chart: {
        spacing: 10
      },
      mapNavigation: {
        buttonOptions: {
          verticalAlign: 'bottom',
          theme: {
            fill: 'rgba(255, 255, 255, 0.2)',
            stroke: 'rgba(255, 255, 255, 0.7)',
            style: {
              color: 'white'
            },
            states: {
              hover: {
                fill: 'rgba(255, 255, 255, 0.4)',
                stroke: 'rgba(255, 255, 255, 0.7)'
              },
              select: {
                fill: 'rgba(255, 255, 255, 0.4)',
                stroke: 'rgba(255, 255, 255, 0.7)'
              }
            }
          }
        },
        enabled: true,
        enableMouseWheelZoom: false
      },
      title: {
        text: '中国',
        floating: true
      },
      xAxis: {
        minRange: 200
      },
      colorAxis: {
        min: 0,
        minColor: '#A9CDF9',
        maxColor: '#006cee',
        labels: {
          style: {
            "color": "red", "fontWeight": "bold"
          }
        }
      },
      legend: {
        enabled: true,
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'bottom',
        floating: true
      },
      tooltip: {
        useHTML: true,
        headerFormat: '<span style="font-size: 10 px;font - weight: bold">{point.key}</span><table>',
        pointFormatter: function () {
          var str = '';
          if (this.shapeType === 'circle') {
            str += this.z + '<tr><td>PV：</td><td ><b></b></td></tr>';
          } else {
            if (mapType == 30)
              str += '<tr><td>PV：</td><td ><b>' + (this.pv || '-') + '</b> </td></tr>' + '<tr><td>UV：</td><td><b>' + (this.uv || '-') + '</b></td></tr>';
            if (mapType == 31)
              str += '<tr><td>首次渲染：</td><td><b>' + (this.fpt || '-') + 'ms</b></td></tr>';
            if (mapType == 32)
              str += '<tr><td>成功率：</td><td><b>' + (this.succRate || '-') + '%</b></td></tr>' + '<tr><td>调用次数：</td><td><b>' + (this.times || '-') + '</b></td></tr>';
            if (mapType == 33)
              str += '<tr><td>调用次数：</td><td><b>' + (this.times || '-') + '</b></td></tr>';
            if (mapType == 34)
              str += '<tr><td>成功耗时：</td><td><b>' + (this.avgTime || '-') + 's</b></td></tr>' + '<tr><td>成功次数：</td><td><b>' + (this.times || '-') + '</b></td></tr>';
            if (mapType == 35)
              str += '<tr><td>失败耗时：</td><td><b>' + (this.avgTime || '-') + 's</b></td></tr>' + '<tr><td>失败次数：</td><td><b>' + (this.times || '-') + '</b></td></tr>';
            if (mapType == 36)
              str += '<tr><td>访问量：</td><td><b>' + (this.pv || '-') + '</b></td></tr>';
          }
          return str;
        },
        footerFormat: '</table>'
      },
      navigation: {
        buttonOptions: {
          symbolStroke: 'rgba(255, 255, 255, 0.8)',
          theme: {
            fill: 'rgba(255, 255, 255, 0.2)',
            states: {
              hover: {
                fill: 'rgba(255, 255, 255, 0.4)',
                stroke: 'transparent'
              },
              select: {
                fill: 'rgba(255, 255, 255, 0.4)',
                stroke: 'transparent'
              }
            }
          }
        }
      }
    }, this.highConfig.ext));
  }

  private renderColumnAndSplineChart() {
    Highcharts.chart(this.containerId, _.extend({}, {
      credits: {
        enabled: false
      },
      chart: {
        zoomType: 'xy',
        height: 280,
        options3d: {
          enabled: true,
          depth: 50
        }
      },
      title: {
        text: null
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        // layout: 'vertical',
      },
      xAxis: {
        // minTickInterval:xAxisMinTickInterval,        
        tickWidth: 0,
        type: 'datetime',
        dateTimeLabelFormats: {
          minute: '%H:%M',
          hour: '%H:%M',
          day: '%m-%d',
          week: '%m-%d',
          month: '%Y-%m',
          year: '%Y'
        }
      },
      tooltip: {
        crosshairs: true,
        shared: true,
        dateTimeLabelFormats: {
          minute: '%H:%M',
          hour: '%m-%d %H:%M',
          day: '%m-%d %H:%M',
          week: '%m-%d %H:%M',
          month: '%Y-%m',
          year: '%Y'
        }
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: false
          }
        },
        column: {
          depth: 25
        }
      }
    }, this.highConfig.ext));
  }

  private renderColumnChart() {
    Highcharts.chart(this.containerId, _.extend({}, {
      credits: {
        enabled: false
      },
      chart: {
        type: 'column',
        height: 280,
        options3d: {
          enabled: true,
          depth: 50
        }
      },
      plotOptions: {
        column: {
          depth: 25
        }
      },
      title: {
        text: null
      },
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        // layout: 'vertical',
      },
      xAxis: {
        // minTickInterval:xAxisMinTickInterval,        
        tickWidth: 0,
        type: 'datetime',
        dateTimeLabelFormats: {
          minute: '%H:%M',
          hour: '%H:%M',
          day: '%m-%d',
          week: '%m-%d',
          month: '%Y-%m',
          year: '%Y'
        }
      },
      tooltip: {
        shared: true,
        dateTimeLabelFormats: {
          minute: '%H:%M',
          hour: '%m-%d %H:%M',
          day: '%m-%d %H:%M',
          week: '%m-%d %H:%M',
          month: '%Y-%m',
          year: '%Y'
        }
      }
    }, this.highConfig.ext));
  }
}
