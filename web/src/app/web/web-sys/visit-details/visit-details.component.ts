import { JsErrorTrackComponent } from './../js-error-track/js-error-track.component';
import { Broadcaster } from './../../../monitor.common.service';
import { slideInDownAnimation } from './../../../animations';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import * as _ from 'lodash';
@Component({
  selector: 'app-visit-details',
  templateUrl: './visit-details.component.html',
  styleUrls: ['./visit-details.component.scss'],
  animations: [slideInDownAnimation]
})
export class VisitDetailsComponent implements OnInit {
  dataSet = [];
  loading = true;
  tableScrollSetting = { y: '320px', x: '1000px' };
  total = 0;
  appKey
  searchModel = {
    keywords: '',
    type: 'pv',
    sTime: null,
    eTime: null,
    pageSize: 100,
    pageIndex: 1,
    appKey: ''
  };
  constructor(
    private http: HttpClient,
    private msg: NzMessageService,
    private route: ActivatedRoute,
    private broadcaster: Broadcaster,
    private modalService:NzModalService
  ) { }
  ngOnInit() {
    this.appKey = this.route.parent.snapshot.paramMap.get("appKey");
    this.searchModel.type = this.route.snapshot.queryParams["type"] || 'pv';
    this.searchModel.keywords = this.route.snapshot.queryParams["keywords"]==undefined ? '' : decodeURIComponent(this.route.snapshot.queryParams["keywords"]);
    this.searchModel.sTime =this.route.snapshot.queryParams["sTime"]==undefined?new Date(new Date().setDate(new Date().getDate() - 1)):this.route.snapshot.queryParams["sTime"];
    this.searchModel.eTime =this.route.snapshot.queryParams["sTime"]==undefined? new Date():new Date(new Date(this.route.snapshot.queryParams["sTime"]).setSeconds(new Date(this.route.snapshot.queryParams["sTime"]).getSeconds() +1));
    this.searchModel.appKey = this.appKey;
    this.searchData(true);
  }

  searchModelType(e) {
    if (e == 'api') {
      this.tableScrollSetting = { y: '320px', x: '1500px' };
    } else {
      this.tableScrollSetting = { y: '320px', x: '1000px' };
    }
    this.searchModel.type = e;
    this.searchData(true);
  }

  searchData(reset: boolean = false): void {
    if (reset) {
      this.searchModel.pageIndex = 1;
    }
    this.loading = true;
    this.searchModel.keywords = this.searchModel.keywords.trim();
    this.http.post("Monitor/List", this.searchModel).subscribe((data: any) => {
      if (data.IsSuccess) {
        this.total = data.Data.TotalCount
        this.loading = false;
        if (this.searchModel.type == 'js') {
          _.each(data.Data.List, (d) => {
            d.error = decodeURIComponent(d.error).replace(/\\n/g,"<br/>");
          });
        }
        this.dataSet = data.Data.List;
      } else {
        this.msg.error("数据加载失败");
      }
    })
  }

  ngAfterContentInit(): void {
    this.broadcaster.broadcast('showGlobalTimer', false);
    (window as any).globalTime = null;
  }

  onOk(data) {
    this.searchModel.sTime = data[0];
    this.searchModel.eTime = data[1];
  }

  errorTrack(data){
    const modal= this.modalService.create({
      nzTitle: '错误场景还原',
      nzMaskClosable:false,
      nzWidth:1366,
      nzContent: JsErrorTrackComponent,
      nzZIndex:3000,
      nzBodyStyle:{
        padding:0
      },
      nzComponentParams: {
        data:data
      },
      nzFooter:null
    });
  }

}
