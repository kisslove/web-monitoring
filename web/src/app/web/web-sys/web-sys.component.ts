
import { fromEvent as observableFromEvent, Observable } from 'rxjs';

import { debounceTime } from 'rxjs/operators';
import { Broadcaster } from './../../monitor.common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UrlNav } from './../../model/entity';

import { Component, ElementRef, ViewChild, Renderer2 } from '@angular/core';


import { NzMessageService } from 'ng-zorro-antd';
declare var window: any
@Component({
  selector: 'app-web-sys',
  templateUrl: './web-sys.component.html',
  styleUrls: ['./web-sys.component.scss']
})
export class WebSysComponent {
  @ViewChild('centerContent') centerContent: ElementRef
  @ViewChild('leftNav') leftNav: ElementRef
  leftNavItems: Array<UrlNav> = [];
  sysItems: Array<any> = [];
  currentSelectedSys;
  showGlobalTimer = true;
  isFullScreen: boolean = false;
  unsubscribe = {
    sub0: null,
    sub1: null
  };
  constructor(
    private render: Renderer2,
    private http: HttpClient,
    private msg: NzMessageService,
    private route: ActivatedRoute,
    private router: Router,
    private broadcaster: Broadcaster
  ) {
    this.leftNavItems = [{
      label: '应用总览',
      value: 'index',
      isActive: false,
      icon: 'laptop'
    }, {
      label: '访问页面',
      value: 'visitPage',
      isActive: false,
      icon: 'switcher'
    }, {
      label: '访问速度',
      value: 'visitSpeed',
      isActive: false,
      icon: 'line-chart'
    },
    {
      label: 'JS错误',
      value: 'jsError',
      isActive: false,
      icon: 'exception'
    },
    {
      label: 'API请求',
      value: 'apiReq',
      isActive: false,
      icon: 'api'
    }, {
      label: '地理',
      value: 'visitGeo',
      isActive: false,
      icon: 'global'
    }, {
      label: '终端',
      value: 'visitOs',
      isActive: false,
      icon: 'ie'
    }, {
      label: '用户行为追踪',
      value: 'userPath',
      isActive: false,
      icon: 'radius-setting'
    }, {
      label: '资源加载详情',
      value: 'resourceDetails',
      isActive: false,
      icon: 'radar-chart'
    }, {
      label: '访问明细',
      value: 'visitDetails',
      isActive: false,
      icon: 'file'
    }, {
      label: '应用设置',
      value: 'setting',
      isActive: false,
      icon: 'setting'
    }];
  }
  ngOnInit(): void {
    this.currentSelectedSys = this.route.snapshot.paramMap.get('appKey');
    this.getSites();
    this.unsubscribe.sub0 = observableFromEvent(window, "resize").pipe(
      debounceTime(100))
      .subscribe((event) => {
        this._resizePageHeight();
      });
    this.unsubscribe.sub0 = observableFromEvent(document, "fullscreenchange")
      .subscribe((event) => {
        this.isFullScreen = this.isfull();
      });
    let temp2 = observableFromEvent(document, "mozfullscreenchange")
      .subscribe((event) => {
        this.isFullScreen = this.isfull();
      });
    this.unsubscribe.sub0.add(temp2);
    let temp3 = observableFromEvent(document, "webkitfullscreenchange")
      .subscribe((event) => {
        this.isFullScreen = this.isfull();
      });
    this.unsubscribe.sub0.add(temp3);
    let temp4 = observableFromEvent(document, "msfullscreenchange")
      .subscribe((event) => {
        this.isFullScreen = this.isfull();
      });

  }
  ngAfterViewInit() {
    this.unsubscribe.sub1 = this.broadcaster.on("showGlobalTimer").subscribe((r: boolean) => {
      let temp = setTimeout(() => {
        this.showGlobalTimer = r;
        clearTimeout(temp);
      });
    });
    this._resizePageHeight();
  }

  ngOnDestroy(): void {
    this.unsubscribe.sub0.unsubscribe();
    this.unsubscribe.sub1.unsubscribe();
  }

  selectedSysChange(e) {
    this.router.navigate(['/sys/' + e + '/index']);
    setTimeout(() => {
      location.reload();
    });
  }

  selectOver(e) {
    window.globalTime = e;
    this.broadcaster.broadcast("choiceTimeToRender", e);
  }

  fullScreen() {
    var el: any = document.documentElement;
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (typeof rfs != "undefined" && rfs) {
      rfs.call(el);
      this.isFullScreen = true;
    };
  }

  exitFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      this.isFullScreen = false;
    }
  }

  private _resizePageHeight() {
    this.render.setStyle(this.centerContent.nativeElement, "height", window.innerHeight - 50 - 70 + "px");
    this.render.setStyle(this.leftNav.nativeElement, "height", window.innerHeight - 50 - 70 + "px");
  }

  private getSites() {
    this.http.get("Monitor/SiteList").subscribe((d: any) => {
      if (d.IsSuccess) {
        this.sysItems = d.Data;
      } else {
        this.msg.error("系统列表加载失败");
      }
    })
  }
  private isfull() {
    return (
      (document as any).fullscreen ||
      (document as any).fullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).webkitFullscreenElement ||
      null);
  }
}
