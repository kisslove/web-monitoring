
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
    appKey:'',
    pageSize:100, 
    pageIndex:1
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
    this.searchData(true);
  }

  searchModelType(e){
    this.searchModel.type=e;
    this.searchData(true);
  }

  searchData(reset:boolean=false): void {
    if (reset) {
      this.searchModel.pageIndex = 1;
    }
    this.loading = true;
    this.searchModel.keywords=this.searchModel.keywords.trim();
    this.http.post("Monitor/resourceList",this.searchModel).subscribe((data:any) => {
      if (data.IsSuccess) {
        this.loading = false;
        this.total=data.Data.TotalCount;
        data.Data.List.forEach(element => {
          if(element.rSize){
            element.rSize=new Number(element.rSize/1024).toFixed(2);
          }
          if(element.rDuration){
            element.rDuration=new Number(element.rDuration).toFixed(2);
          }else{
            element.rDuration=0;
          }
        });
        this.dataSet=data.Data.List;
      } else {
        this.msg.error("数据加载失败");
      }
    })
  }

  ngAfterContentInit(): void {
    this.broadcaster.broadcast('showGlobalTimer',false);
    (window as any).globalTime=null;
  }

  onOk(data){
    this.searchModel.sTime=data[0];
    this.searchModel.eTime=data[1];
  }

}

