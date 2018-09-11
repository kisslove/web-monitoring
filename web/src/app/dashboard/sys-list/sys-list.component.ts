import { HighchartConfig } from './../../model/entity';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';
import * as _ from "lodash";
@Component({
  selector: 'app-sys-list',
  templateUrl: './sys-list.component.html',
  styleUrls: ['./sys-list.component.scss']
})
export class SysListComponent implements OnInit {
  sysItems: Array<any> = [];
  isVisible_add: boolean = false;
  appName = '';
  systemId = '';
  isSpinning: boolean = true;
  validUser = false;
  pv_uv_config: HighchartConfig;
  total_pv_uv:any={};
  constructor(
    private route: Router,
    private http: HttpClient,
    private msg: NzMessageService
  ) { }

  ngOnInit() {
    if(sessionStorage.getItem("t_eew")){
      this.validUser = true;
      this.list();
      return;
    }
    var pwd = prompt("请输入口令", "");
    if (pwd != null && pwd != "" && pwd == '123456') {
      sessionStorage.setItem("t_eew",Date.now().toString());
      this.validUser = true;
      this.list();
    } else {
      this.validUser = false;
      this.msg.error("口令不正确");
    }
  }

  gotoSys(item) {
    this.route.navigate(['sys/' + item.appKey]);
  }

  gotoSysSetting(item) {
    this.route.navigate(['sys/' + item.appKey + '/setting']);
  }

  addSys() {
    this.isVisible_add = true;
  }

  list() {
    this.isSpinning = true;
    this.http.post("Monitor/SiteList", {}).subscribe((data: any) => {
      if (data.IsSuccess) {
        this.sysItems = data.Data;
        _.each(this.sysItems, (r)=>{
          this.loadPvUvData(r);
        })
      }
      this.isSpinning = false;
    })
  }

  save() {
    if (!this.appName) {
      this.msg.info("站点名称和业务系统ID必填");
      return;
    }
    this.http.post("Monitor/RegisterSite", {
      appName: this.appName,
      systemId: this.systemId
    }).subscribe((data: any) => {
      if (data.IsSuccess) {
        // this.broadcaster.broadcast("getTreeData");
        this.msg.success('创建成功');
        this.list();
        this.isVisible_add = false;
      } else {
        this.msg.error("创建失败");
      }
    })
  }

  cancel() {
    this.isVisible_add = false;
  }
   //加载PV/UV数据
   loadPvUvData(data) {
     console.log(data);
     
    this.http.post("Monitor/PvAndUvStatis", {
      TimeQuantum: 4,
      sTime:  '',
      eTime: '',
      appKey: data.appKey
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.renderPvUvChart(d.Data,data);
      }
    })
  }
  //渲染PV/UV对比图
  renderPvUvChart(data,item) {
    
    let tempData = {
      pv: [],
      uv: []
    };

    item.total_pv_uv={
      totalPv:data.totalPv,
      totalUv:data.totalUv
    };
    _.each(data.pvAndUvVmList, (val) => {
      tempData.pv.push([new Date(val.createTime).getTime(), val.pv]);
      tempData.uv.push([new Date(val.createTime).getTime(), val.uv]);
    });
    item.pv_uv_config = {
      type: 10,
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
}
