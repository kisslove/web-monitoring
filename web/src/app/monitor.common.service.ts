
import { throwError as observableThrowError, Observable, Subject } from 'rxjs';
import * as _ from "lodash";
import { filter, map, catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Injectable, Inject, Optional } from '@angular/core';
import { environment } from '../environments/environment';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { Router, CanDeactivate } from '@angular/router';

interface BroadcastEvent {
  key: any;
  data?: any;
}

/**
 * 
 * 事件订阅-基于RxJS Subject
 * @export
 * @class Broadcaster
 * example:
  @Component({
      selector: 'child'
  })
  export class ChildComponent {
    constructor(private broadcaster: Broadcaster) {}
    
    registerStringBroadcast() {
      this.broadcaster.on<string>('MyEvent')
        .subscribe(message => {
          ...
        });
    }

    emitStringBroadcast() {
      this.broadcaster.broadcast('MyEvent', 'some message');
    }
  }
 */
@Injectable()
export class Broadcaster {
  private _eventBus: Subject<BroadcastEvent>;

  constructor() {
    this._eventBus = new Subject<BroadcastEvent>();
  }

  broadcast(key: any, data?: any) {
    this._eventBus.next({ key, data });
  }

  on<T>(key: any): Observable<T> {
    return this._eventBus.asObservable().pipe(
      filter(event => event.key === key),
      map(event => <T>event.data));
  }
}


@Injectable()
export class UserService {
  constructor(private _cookie: CookieService) { }

  getToken() {
    return this._cookie.get('user') && JSON.parse(this._cookie.get('user'))['token'] || '';
  }

  getUserId() {
    return this._cookie.get('user') && JSON.parse(this._cookie.get('user'))['userId'] || '';
  }

  isAdmin() {
    return this.getUserId()==='5c3dce2b5a0e170a74e608c6';
  }

  getUserName() {
    return this._cookie.get('user') && JSON.parse(this._cookie.get('user'))['userName'] || '';
  }

}

@Injectable()
export class ConfigService {
  constructor() { }
  apiUrl = environment.apiUrl;
  helper = {
    isStringEmpty: function (str) {
      if (!str || str.replace(/(^\s*)|(\s*$)/g, "").length == 0) {
        return true;
      }
      return false;
    },
    isDate: (strInputDate) => {
      if (strInputDate == "") return false;
      strInputDate = strInputDate.replace(/-/g, "/");
      var d = new Date(strInputDate);
      if (isNaN(parseInt(d.toString()))) return false;
      var arr = strInputDate.split("/");
      return ((parseInt(arr[0], 10) == d.getFullYear()) && (parseInt(arr[1], 10) == (d.getMonth() + 1)) && (parseInt(arr[2], 10) == d.getDate()));
    },
    isYear: function (str) {
      var re = /^([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})$/;
      if (re.test(str)) {
        return true;
      } else {
        return false;
      }
    },
    isEmail: function (email) {
      var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
      if (re.test(email)) {
        return true;
      } else {
        return false;
      }
    },
    isPositiveInt: function (number) {
      var re = /^\d+$/;
      if (re.test(number)) {
        return true;
      } else {
        return false;
      }
    },
    isPositiveIntAndZero: function (number) {
      var re = /^\d+$/;
      if (number == 0)
        return true;
      if (re.test(number)) {
        return true;
      } else {
        return false;
      }
    },
    isNumber: function (number) {
      var re = /^(-?\d+)(\.\d+)?$/;
      if (re.test(number)) {
        return true;
      } else {
        return false;
      }
    },
    isNumberAndZero: function (number) {
      if (number == 0)
        return true;
      var re = /^(-?\d+)(\.\d+)?$/;
      if (re.test(number)) {
        return true;
      } else {
        return false;
      }
    },
    isInt: function (number) {
      return number % 1 === 0;
    },
    isPositiveNumber: function (number) {
      if (number == 0)
        return true;
      var re = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;
      if (re.test(number)) {
        return true;
      } else {
        return false;
      }
    },
    isTelPhone: function (Telphone) {
      var re = /^0\d{2,3}-?\d{7,8}$/;
      if (re.test(Telphone)) {
        return true;
      } else {
        return false;
      }
    },
    isMobilePhone: function (Mobilephone) {
      var re = /^1\d{10}$/;
      if (re.test(Mobilephone)) {
        return true;
      } else {
        return false;
      }
    },
    isValidString: function (str) {
      var re = /^[a-zA-Z_][a-zA-Z0-9_]*$/g;
      if (re.test(str)) {
        return true;
      } else {
        return false;
      }
    },
    isStrongPass: function (pass) {

      if (pass.length < 8) {
        return 0;
      }
      var ls = 0;
      if (pass.match(/([a-z])+/)) {
        ls++;
      }
      if (pass.match(/([0-9])+/)) {
        ls++;
      }
      if (pass.match(/([A-Z])+/)) {

        ls++;

      }
      if (pass.match(/[^a-zA-Z0-9]+/)) {
        ls++;
      }
      return ls > 3;
    },
    isUrl: function (url) {
      //在JavaScript中，正则表达式只能使用"/"开头和结束，不能使用双引号 
      var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
      var objExp = new RegExp(Expression);
      if (url.indexOf("localhost")) {
        url = url.replace("localhost", "127.0.0.1");
      }
      if (objExp.test(url) == true) {
        return true;
      } else {
        return false;
      }
    },
    currentDomain: function (str) {
      let parseDomain = function (str) {
        if (!str) return '';
        if (str.indexOf('://') != -1) str = str.substr(str.indexOf('://') + 3);
        var topLevel = ['com', 'net', 'org', 'gov', 'edu', 'mil', 'biz', 'name', 'info', 'mobi', 'pro', 'travel', 'museum', 'int', 'areo', 'post', 'rec'];
        var domains = str.split('.');
        if (domains.length <= 1) return str;
        if (!isNaN(domains[domains.length - 1])) return str;
        var i = 0;
        while (i < topLevel.length && topLevel[i] != domains[domains.length - 1]) i++;
        if (i != topLevel.length) return domains[domains.length - 2] + '.' + domains[domains.length - 1];
        else {
          i = 0;
          while (i < topLevel.length && topLevel[i] != domains[domains.length - 2]) i++;
          if (i == topLevel.length) return domains[domains.length - 2] + '.' + domains[domains.length - 1];
          else return domains[domains.length - 3] + '.' + domains[domains.length - 2] + '.' + domains[domains.length - 1];
        }
      }

      return parseDomain(str);
    }
  }
}

/**
 * 
 * 请求拦截器
 * @export
 * @class JwtInterceptorService
 * @implements {HttpInterceptor}
 */
@Injectable()
export class JwtInterceptorService implements HttpInterceptor {
  ref
  constructor(
    private config: ConfigService,
    private router: Router,
    private _msg: NzMessageService,
    private user: UserService,
    private modalService:NzModalService,
    private cookie:CookieService,
    @Optional() private broadcaster:Broadcaster
  ) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      url: this.config.apiUrl + req.url,
      setHeaders: {
        authorization: this.user.getToken()
      }
    });

    return next.handle(req).pipe(
      map((event) => {
        if (event instanceof HttpResponse) {
          if (event.status === 200) {
            if (event.body && event.body.status === 0) {

            } else if (event.body && event.body.status === 1) {
              if (event.body.Authority === 2) {
                this._msg.error('没有访问权限', { nzDuration: 5000 });
                return;
              }
            }
          }
          return event;
        }
      }),
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            //登录信息过期
            if (this.ref) {
              this.ref.close()
          }
          this.ref = this.modalService.confirm({
              nzTitle: '<span>登录信息过期,请重新登录系统</span>',
              nzOnOk: () => {
                  this.router.navigate(['login']);
                  this.broadcaster.broadcast("refreshUser",null);
                  this.cookie.delete("user");
                  this.router.navigate(['home']);
              }
          });
          }
          if (err.status === 500) {
            //服务器错误
            this._msg.error(err.error.message || err.error.Message || '服务器错误', { nzDuration: 5000 });
          }
          if (err.status === 0) {
            //服务器错误
            this._msg.error(err.error.message || '服务器错误', { nzDuration: 5000 });
          }
          return observableThrowError(err);
        }
        if (err instanceof Error) {
          this._msg.error('服务器连不上了,请稍后访问', { nzDuration: 5000 });
          return observableThrowError(err);
        }
      }))
  }
}





















