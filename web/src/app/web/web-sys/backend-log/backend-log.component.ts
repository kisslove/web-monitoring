import { slideInDownAnimation } from './../../../animations';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Component, OnInit } from '@angular/core';
import { NzMessageService,NzModalService  } from 'ng-zorro-antd';
import * as _ from 'lodash';
@Component({
  selector: 'app-backend-log',
  templateUrl: './backend-log.component.html',
  styleUrls: ['./backend-log.component.scss'],
  animations: [slideInDownAnimation]
})
export class BackendLogComponent implements OnInit {
  dataSet = [];
  logDetails;
  loading = true;
  modalLoading = true;
  tableScrollSetting = { y: '320px' };
  total = 0;
  searchModel = {
    bussnessId: '',
    logEnum: '',
    startTime: null,
    endTime: null,
    pageSize: 50,
    pageIndex: 1,
    msg:''
  };
  appKey;
  currentSite
  constructor(
    private http: HttpClient,
    private msg: NzMessageService,
    private route: ActivatedRoute,
    private modalService: NzModalService
  ) { }

  ngOnInit() {
    this.appKey = this.route.parent.snapshot.paramMap.get("appKey");
    this.searchModel.startTime = new Date(new Date().setDate(new Date().getDate() - 1));
    this.searchModel.endTime = new Date();
    this.getSites();
  }

  private getSites() {
    this.http.get("Monitor/SiteList").subscribe((d: any) => {
      if (d.IsSuccess) {
        let currentSys = _.filter(d.Data, { 'appKey': this.appKey });
        this.currentSite = currentSys[0];
        this.searchModel.bussnessId =  this.currentSite.systemId;
        if(!this.searchModel.bussnessId){
          this.msg.info("请先在应用设置页面添加业务系统ID");
          return;
        }
        this.searchData(true);
      }
    });
  }

  searchModelType(e) {
    this.searchModel.logEnum = e;
    this.searchData(true);
  }

  searchData(reset: boolean = false): void {
    if (reset) {
      this.searchModel.pageIndex = 1;
    }
    this.loading = true;
    this.http.post("SystemLog/List", this.searchModel).subscribe((data: any) => {
      if (data.IsSuccess) {
        this.total = data.Data.TotalCount
        this.loading = false;
        this.dataSet = data.Data.List;
      } else {
        this.msg.error("数据加载失败");
      }
    });
  }

  onOk(data) {
    this.searchModel.startTime = data[0];
    this.searchModel.endTime = data[1];
  }

  goDetails(data,tplContent){
    this.modalLoading=true;
    this.modalService.info({
      nzTitle: '详情',
      nzContent: tplContent,
      nzWidth:1000
    });
    this.http.post("SystemLog/Details", {
      errorGuid:data.Id
    }).subscribe((data: any) => {
      if (data.IsSuccess) {
        this.logDetails = data.Data;
      } else {
        this.msg.error("数据加载失败");
      }
      this.modalLoading=false;
    });
  }

}
