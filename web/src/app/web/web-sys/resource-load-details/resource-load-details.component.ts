
import { Broadcaster } from './../../../monitor.common.service';
import { slideInDownAnimation } from './../../../animations';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import * as _ from 'lodash';
@Component({
  selector: 'app-resource-load-details',
  templateUrl: './resource-load-details.component.html',
  styleUrls: ['./resource-load-details.component.scss'],
  animations: [slideInDownAnimation]
})
export class ResourceLoadDetailsComponent implements OnInit {
  dataSet = [];
  loading = true;
  tableScrollSetting={ y: '280px',x:'1000px' };
  total=0;
  appKey;
  searchModel={
    keywords:'',
    type:'',
    sTime:null,
    eTime:null,
    appKey:''
  };
  constructor(
    private http:HttpClient,
    private msg:NzMessageService,
    private route: ActivatedRoute,
    private broadcaster:Broadcaster
  ) { }
  ngOnInit() {
    
    this.appKey = this.route.parent.snapshot.paramMap.get("appKey");
    this.searchModel.sTime=new Date(new Date().setDate(new Date().getDate()-1));
    this.searchModel.eTime=new Date();
    this.searchModel.appKey=this.appKey;
    this.searchData();
  }

  searchModelType(e){
    this.searchModel.type=e;
    this.searchData();
  }

  searchData(): void {
    this.loading = true;
    this.searchModel.keywords=this.searchModel.keywords.trim();
    this.http.post("Monitor/resourceListStatis",this.searchModel).subscribe((data:any) => {
      if (data.IsSuccess) {
        this.total=data.Data.length
        this.loading = false;
        this.dataSet=data.Data;
      } else {
        this.msg.error("数据加载失败");
      }
    })
  }

  ngAfterContentInit(): void {
    this.broadcaster.broadcast('showGlobalTimer',false);
  }

  onOk(data){
    this.searchModel.sTime=data[0];
    this.searchModel.eTime=data[1];
  }

}

