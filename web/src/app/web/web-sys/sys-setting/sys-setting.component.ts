
import {fromEvent as observableFromEvent,  Observable } from 'rxjs';

import {debounceTime} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../environments/environment';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import * as _ from 'lodash';


@Component({
  selector: 'app-sys-setting',
  templateUrl: './sys-setting.component.html',
  styleUrls: ['./sys-setting.component.scss']
})
export class SysSettingComponent implements OnInit {
  setting = {
    disableHook: false,
    disableJS: true,
    code: '',
    backendUrl: environment.uploadDataUrl,
    jsHackUrl: environment.jsHackUrl
  };
  tip = {
    code1: null
  };
  unsub: any = null;
  currentSite: any = {};
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private msg: NzMessageService
  ) {

  }

  ngOnInit() {
    this.currentSite.appKey = this.route.parent.snapshot.paramMap.get('appKey');
    this.tip.code1 = `
    export class MyErrorHandler implements ErrorHandler {
      handleError(error) {
        console.error(error);
        window.__ml && window.__ml.error && window.__ml.error(error.stack || error);
      }
    }
    @NgModule({
      declarations: [],
      imports: [],
      providers: [{ provide: ErrorHandler, useClass: MyErrorHandler }],
      bootstrap: []
    })
    export class AppModule { }
    `
    this.getSites();
  }

  settingChange1(data) {
    this.currentSite.disableHook = data;
    this.generateCode();
    this.setSite();
  }

  settingChange2(data) {
    this.currentSite.disableJS = data;
    this.generateCode();
    this.setSite();
  }

  settingChangeInput($event) {
    if (!this.currentSite.systemId) {
      return;
    }
    if (this.unsub) {
      return;
    }
    this.unsub = observableFromEvent($event.target, "input").pipe(
      debounceTime(1000))
      .subscribe((event) => {
        if (!this.currentSite.systemId) {
          return;
        }
        this.setSite();
        this.unsub.unsubscribe();
        this.unsub = null;
      });
    this.setSite();
  }

  private getSites() {
    this.http.get("Monitor/SiteList").subscribe((d: any) => {
      if (d.IsSuccess) {
        let currentSys = _.filter(d.Data, { 'appKey': this.currentSite.appKey });
        delete currentSys[0]['createTime'];
        delete currentSys[0]['updateTime'];
        this.currentSite = currentSys[0];
        this.generateCode();
      }
    });
  }
  private setSite() {
    this.http.post("Monitor/SiteSet", this.currentSite).subscribe((d: any) => {
    });
  }

  private generateCode() {
    this.setting.code = `<script>
    !(function (c, b, d, a) {
      c[a] || (c[a] = {});
      c[a].config = { appKey: '${this.currentSite.appKey}', imgUrl: '${this.setting.backendUrl}?',disableHook:${this.currentSite.disableHook}, disableJS:${this.currentSite.disableJS} };
      var dom = document.createElement("script");
      dom.setAttribute("crossorigin", "anonymous");
      dom.setAttribute("src", d);
      document.body.insertBefore(dom, document.body.firstChild);
    })(window, document, '${this.setting.jsHackUrl}', "__ml");
  </script>`
  }

}
