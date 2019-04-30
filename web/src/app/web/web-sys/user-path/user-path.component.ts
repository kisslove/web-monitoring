

import { fromEvent as observableFromEvent, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Broadcaster } from './../../../monitor.common.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChildren, ElementRef, Renderer2 } from '@angular/core';
import * as _ from 'lodash';
declare var window: any
@Component({
  selector: 'app-user-path',
  templateUrl: './user-path.component.html',
  styleUrls: ['./user-path.component.scss']
})
export class UserPathComponent implements OnInit {
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
  userPathListData = [];
  currentSelectedUserPath
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
      this.loadUserPathList(data.time, data.type);
    });
    if (window.globalTime) {
      this.loadUserPathList(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadUserPathList(null, 4);
    }

  }

  search() {
    this.currentSelectedUserPath=null;
    if (window.globalTime) {
      this.loadUserPathList(window.globalTime.time, window.globalTime.type);
    } else {
      this.loadUserPathList(null, 4);
    }
  }


  //获取用户访问列表
  loadUserPathList(time, type) {
    this.isSpinning.spin1 = true;
    this.http.post("Monitor/userPathListStatis", {
      TimeQuantum: type == '7' ? '' : type,
      sTime: type == '7' ? time[0] : '',
      eTime: type == '7' ? time[1] : '',
      appKey: this.appKey,
      keywords: this.keywords
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        if (d.Data && d.Data.length > 0) {
          d.Data[0]['select'] = true;
          this.userPathListData = d.Data;
          this.selectUserPathListItem(d.Data[0]);
        } else {
          this.userPathListData = [];
        }

      }
      this.isSpinning.spin1 = false;
    });
  }

  selectUserPathListItem(data) {
    _.each(this.userPathListData, (val) => {
      val.select = false;
    });
    data.select = true;
    this.currentSelectedUserPath = data;
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

}






