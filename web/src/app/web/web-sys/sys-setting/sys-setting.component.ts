import { Broadcaster, UserService } from './../../../monitor.common.service';

import { fromEvent as observableFromEvent, Observable } from 'rxjs';

import { debounceTime } from 'rxjs/operators';
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
  showAlarmArea = false;
  setting = {
    disableHook: false,
    disableJS: true,
    disableResource: false,
    code: '',
    backendUrl: environment.uploadDataUrl,
    jsHackUrl: environment.jsHackUrl,
    userId: null
  };
  jsErrorAlarm = {
    appKey: null,
    email: null,
    alarmTimes: null,
    alarmState: false,
    alarmLimit: null
  };
  apiErrorAlarm = {
    appKey: null,
    email: null,
    alarmTimes: null,
    alarmState: false,
    alarmLimit: null
  };
  perfSpeedAlarm = {
    appKey: null,
    email: null,
    alarmTimes: null,
    alarmState: false,
    alarmLimit: null
  };
  tip = {
    code1: null
  };
  unsub: any = null;
  currentSite: any = {};
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private msg: NzMessageService,
    private broadcaster: Broadcaster,
    private user: UserService
  ) {

  }

  ngOnInit() {
    if (this.user.getUserId()) {
      this.showAlarmArea = true;
    }
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

  settingChange3(data) {
    this.currentSite.disableResource = data;
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

        this.jsErrorAlarm.alarmLimit = this.currentSite.alarmJsLimit;
        this.jsErrorAlarm.alarmState = this.currentSite.alarmJsState;
        this.jsErrorAlarm.alarmTimes = this.currentSite.alarmJsTimes;
        this.jsErrorAlarm.email = this.currentSite.alarmJsEmail;

        this.apiErrorAlarm.alarmLimit = this.currentSite.alarmApiLimit;
        this.apiErrorAlarm.alarmState = this.currentSite.alarmApiState;
        this.apiErrorAlarm.alarmTimes = this.currentSite.alarmApiTimes;
        this.apiErrorAlarm.email = this.currentSite.alarmApiEmail;

        this.perfSpeedAlarm.alarmLimit = this.currentSite.alarmPerfLimit;
        this.perfSpeedAlarm.alarmState = this.currentSite.alarmPerfState;
        this.perfSpeedAlarm.alarmTimes = this.currentSite.alarmPerfTimes;
        this.perfSpeedAlarm.email = this.currentSite.alarmPerfEmail;
        this.generateCode();
      }
    });
  }
  private setSite() {
    this.http.post("Monitor/SiteSet", this.currentSite).subscribe((d: any) => {
    });
  }


  jsErrorUpdate() {
    if (this.jsErrorAlarm.alarmTimes == null) {
      this.msg.info('分钟数必须大于0');
      return;
    }
    if (this.jsErrorAlarm.alarmLimit == null) {
      this.msg.info('阈值必须大于0');
      return;
    }
    if (!this.jsErrorAlarm.email) {
      this.msg.info('必须填写邮箱');
      return;
    }
    this.http.post("Monitor/AlarmJsErrorUpdate", {
      id: this.currentSite.appKey,
      email: this.jsErrorAlarm.email,
      alarmTimes: this.jsErrorAlarm.alarmTimes,
      alarmState: this.jsErrorAlarm.alarmState,
      alarmLimit: this.jsErrorAlarm.alarmLimit
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.msg.success("设置成功");
      }
    });
  }

  apiErrorUpdate() {
    if (this.apiErrorAlarm.alarmTimes == null) {
      this.msg.info('分钟数必须大于0');
      return;
    }
    if (this.apiErrorAlarm.alarmLimit == null) {
      this.msg.info('阈值必须大于0');
      return;
    }
    if (!this.apiErrorAlarm.email) {
      this.msg.info('必须填写邮箱');
      return;
    }
    this.http.post("Monitor/AlarmApiErrorUpdate", {
      id: this.currentSite.appKey,
      email: this.apiErrorAlarm.email,
      alarmTimes: this.apiErrorAlarm.alarmTimes,
      alarmState: this.apiErrorAlarm.alarmState,
      alarmLimit: this.apiErrorAlarm.alarmLimit
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.msg.success("设置成功");
      }
    });
  }

  perfSpeedUpdate() {
    if (this.perfSpeedAlarm.alarmTimes == null) {
      this.msg.info('分钟数必须大于0');
      return;
    }
    if (this.perfSpeedAlarm.alarmLimit == null) {
      this.msg.info('阈值必须大于0');
      return;
    }
    if (!this.perfSpeedAlarm.email) {
      this.msg.info('必须填写邮箱');
      return;
    }
    this.http.post("Monitor/AlarmPerfSpeedUpdate", {
      id: this.currentSite.appKey,
      email: this.perfSpeedAlarm.email,
      alarmTimes: this.perfSpeedAlarm.alarmTimes,
      alarmState: this.perfSpeedAlarm.alarmState,
      alarmLimit: this.perfSpeedAlarm.alarmLimit
    }).subscribe((d: any) => {
      if (d.IsSuccess) {
        this.msg.success("设置成功");
      }
    });
  }

  private generateCode() {
    this.setting.code = `<script>
    !(function (c, b, d, a) {
      c[a] || (c[a] = {});
      c[a].config = { userId: '${this.currentSite.userId ? this.currentSite.userId : ''}',appKey: '${this.currentSite.appKey}', imgUrl: '${this.setting.backendUrl}?',disableHook:${this.currentSite.disableHook}, disableJS:${this.currentSite.disableJS},disableResource:${this.currentSite.disableResource ? true : false} };
      var dom = document.createElement("script");
      dom.setAttribute("crossorigin", "anonymous");
      dom.setAttribute("src", d);
      document.body.insertBefore(dom, document.body.firstChild);
    })(window, document, '${this.setting.jsHackUrl}', "__ml");
  </script>`
  }

  ngAfterContentInit(): void {
    this.broadcaster.broadcast('showGlobalTimer', false);
    (window as any).globalTime = null;
  }

}
