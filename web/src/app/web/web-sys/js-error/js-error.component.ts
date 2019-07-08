import { JsErrorTrackComponent } from './../js-error-track/js-error-track.component';


import { fromEvent as observableFromEvent, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Broadcaster } from './../../../monitor.common.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChildren, ElementRef, Renderer2 } from '@angular/core';
import * as _ from 'lodash';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
declare var window: any
@Component({
  selector: 'app-js-error',
  templateUrl: './js-error.component.html',
  styleUrls: ['./js-error.component.scss']
})
export class JsErrorComponent implements OnInit {
  @ViewChildren('mydetailsContent') mydetailsContent: Array<ElementRef>
  unsubscribe = {
    sub0: null,
    sub1: null
  }
  isSpinning = {
    spin1: true,
    spin2: true
  };
  appKey;
  keywords;
  pageIndex=1;
  pageSize=50;
  jsErrorListData = [];
  jsErrorListDataTotal = 0;
  currentSelected
  constructor(
    private render: Renderer2,
    private http: HttpClient,
    private broadcaster: Broadcaster,
    private route: ActivatedRoute,
    private msg:NzMessageService,
    private modalService:NzModalService
  ) { }

  ngOnInit() {

    this.appKey = this.route.parent.snapshot.paramMap.get("appKey");
    this.unsubscribe.sub0 = observableFromEvent(window, "resize").pipe(
      debounceTime(100))
      .subscribe((event) => {
        this._resizePageHeight();
      });

    this.unsubscribe.sub1 = this.broadcaster.on("choiceTimeToRender").subscribe((data: any) => {
      this.loadUserPathList(data.time, data.type);
    });
    if (window.globalTime) {
      this.loadUserPathList(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadUserPathList(null, 4);
    }

  }

  search() {
    this.currentSelected = null;
    if (window.globalTime) {
      this.loadUserPathList(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadUserPathList(null, 4);
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
    this.http.post("Monitor/List", {
      TimeQuantum: type == '7' ? '' : type,
      type: "js",
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.keywords||"",
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
    }).subscribe((data: any) => {
      if (data.IsSuccess) {
        if (data.Data.List && data.Data.List.length > 0) {
          _.each(data.Data.List, (d) => {
            d.error = decodeURIComponent(d.error).replace(/\\n/g, "<br/>");
          });
          this.jsErrorListData = [...this.jsErrorListData,...data.Data.List];
        }
      }
      this.isSpinning.spin1 = false;
    });
  }


  //获取jsError列表
  loadUserPathList(time, type) {
    this.isSpinning.spin1 = true;
    this.pageIndex=1;
    this.http.post("Monitor/List", {
      TimeQuantum: type == '7' ? '' : type,
      type: "js",
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.keywords||"",
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
    }).subscribe((data: any) => {
      if (data.IsSuccess) {
        if (data.Data.List && data.Data.List.length > 0) {
          data.Data.List[0]['select'] = true;
          _.each(data.Data.List, (d) => {
            d.error = decodeURIComponent(d.error).replace(/\\n/g, "<br/>");
          });
          this.jsErrorListData = data.Data.List;
          this.jsErrorListDataTotal=data.Data.TotalCount;
          this.selectListItem(data.Data.List[0]);
        } else {
          this.currentSelected=null;
          this.jsErrorListData = [];
        }
      }
      this.isSpinning.spin1 = false;
    });
  }

  selectListItem(data) {
    _.each(this.jsErrorListData, (val) => {
      val.select = false;
    });
    data.select = true;
    this.currentSelected = data;
  }

  ngAfterViewInit() {
    this.broadcaster.broadcast('showGlobalTimer', true);
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

  errorTrack(){
    if(!this.currentSelected){
      this.msg.info('选择一条错误数据');
      return;
    }
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
        data:this.currentSelected
      },
      nzFooter:null
    });
  }
}









