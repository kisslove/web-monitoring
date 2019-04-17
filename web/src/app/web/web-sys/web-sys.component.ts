
import {fromEvent as observableFromEvent,  Observable } from 'rxjs';

import {debounceTime} from 'rxjs/operators';
import { Broadcaster } from './../../monitor.common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UrlNav } from './../../model/entity';

import { Component ,ElementRef, ViewChild, Renderer2} from '@angular/core';


import { NzMessageService } from 'ng-zorro-antd';
declare var window:any

@Component({
  selector: 'app-web-sys',
  templateUrl: './web-sys.component.html',
  styleUrls: ['./web-sys.component.scss'] 
})
export class WebSysComponent {
  @ViewChild('centerContent') centerContent: ElementRef
  @ViewChild('leftNav') leftNav: ElementRef
  leftNavItems:Array<UrlNav>=[];
  sysItems:Array<any>=[];
  currentSelectedSys;
  showGlobalTimer=true;
  unsubscribe={
    sub0:null,
    sub1:null
  };
  constructor(
    private render: Renderer2,
    private http:HttpClient,
    private msg:NzMessageService,
    private route:ActivatedRoute,
    private router:Router,
    private broadcaster:Broadcaster
  ){
    this.leftNavItems=[{
      label:'应用总览',
      value:'index',
      isActive:false,
      icon:'anticon anticon-laptop'
    },{
      label:'访问页面',
      value:'visitPage',
      isActive:false,
      icon:'anticon anticon-switcher'
    },{
      label:'访问速度',
      value:'visitSpeed',
      isActive:false,
      icon:'anticon anticon-line-chart'
    },
    // { 
    //   label:'JS错误率',
    //   value:'jsError',
    //   isActive:false,
    //   icon:'anticon anticon-exception'
    // }
    // ,
    {
      label:'API请求',
      value:'apiReq',
      isActive:false,
      icon:'anticon anticon-api'
    },{
      label:'地理',
      value:'visitGeo',
      isActive:false,
      icon:'anticon anticon-global'
    },{
      label:'终端',
      value:'visitOs',
      isActive:false,
      icon:'anticon anticon-ie'
    },{ 
      label:'访问明细',
      value:'visitDetails',
      isActive:false,
      icon:'anticon anticon-file'
    }
    // ,{
    //   label:'后端日志',
    //   value:'backendLog',
    //   isActive:false,
    //   icon:'anticon anticon-profile'
    // }
    ,{ 
      label:'应用设置',
      value:'setting',
      isActive:false,
      icon:'anticon anticon-setting'
    }];
  }
  ngOnInit(): void {
    this.currentSelectedSys= this.route.snapshot.paramMap.get('appKey');
    this.getSites();
    this.unsubscribe.sub0=observableFromEvent(window, "resize").pipe(
    debounceTime(100))
    .subscribe((event) => {
      this._resizePageHeight();
    });
    
  }
  ngAfterViewInit() {
    this.unsubscribe.sub1=this.broadcaster.on("showGlobalTimer").subscribe((r:boolean)=>{
      let temp=setTimeout(()=>{
        this.showGlobalTimer=r;
        clearTimeout(temp);
      });
    });
    this._resizePageHeight();
  }

  ngOnDestroy(): void {
    this.unsubscribe.sub0.unsubscribe();
    this.unsubscribe.sub1.unsubscribe();
  }

  selectedSysChange(e){
    this.router.navigate(['/sys/'+e+'/index']);
    setTimeout(()=>{
      location.reload();
    });
  }

  selectOver(e){
    window.globalTime=e;
    this.broadcaster.broadcast("choiceTimeToRender",e);
  }
 
  private _resizePageHeight() {
    this.render.setStyle(this.centerContent.nativeElement, "height", window.innerHeight - 50 - 70 + "px");
    this.render.setStyle(this.leftNav.nativeElement, "height", window.innerHeight - 50 - 70 + "px");
  }

  private getSites(){
    this.http.get("Monitor/SiteList").subscribe((d:any)=>{
      if(d.IsSuccess){
        this.sysItems=d.Data;
      }else{
        this.msg.error("系统列表加载失败");
      }
    })
  }
}
