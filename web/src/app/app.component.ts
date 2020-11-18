import { CookieService } from "ngx-cookie-service";
import { HttpClient } from "@angular/common/http";
import { NzMessageService } from "ng-zorro-antd";
import { Router } from "@angular/router";
import { UserService, Broadcaster } from "./monitor.common.service";
import { Component, ElementRef, ViewChild, Renderer2 } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  userName = null;
  unsubscribe = {
    sub0: null,
  };
  showTips: boolean = true;
  dataItems = [
    {
      url: "https://s.imooc.com/Wxv7KHc",
      src: "1.png",
      title: "两小时学会 Node.js stream",
    },
    {
      url: "https://s.imooc.com/Wlba9hm",
      src: "2.png",
      title: "一条龙的 Node·Vue·React 服务器部署",
    },
    {
      url: "https://s.imooc.com/SNTMyFV",
      src: "3.png",
      title: "纯正商业级应用 Node.js Koa2开发微信小程序服务端",
    },
    {
      url: "https://s.imooc.com/SoXuPiZ",
      src: "4.png",
      title: "前端下一代开发语言TypeScript  从基础到axios实战",
    },
    {
      url: "https://s.imooc.com/SxjKSih",
      src: "5.png",
      title: "从基础到实战 手把手带你掌握新版Webpack4.0",
    },
    {
      url: "https://s.imooc.com/SYa6RSU",
      src: "6.png",
      title: "JavaScript版 数据结构与算法",
    },
  ];
  dataItems1 = [
    {
      src: "weixin-gongzhonghao.jpg",
      title: "微信公众号",
    },
  ];
  constructor(
    private user: UserService,
    private router: Router,
    private msg: NzMessageService,
    private http: HttpClient,
    private cookie: CookieService,
    private broadcaster: Broadcaster
  ) {}
  ngOnInit(): void {
    this.userName = this.user.getUserName();
    this.unsubscribe.sub0 = this.broadcaster.on("refreshUser").subscribe(() => {
      this.userName = this.user.getUserName();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.sub0.unsubscribe();
  }

  logout() {
    this.http
      .post(
        "user/logout",
        {},
        {
          params: {
            id: this.user.getUserId(),
          },
        }
      )
      .subscribe((data: any) => {
        if (data.IsSuccess) {
          this.cookie.delete("user");
          this.userName = null;
          this.router.navigate(["home"], { replaceUrl: true });
        } else {
          this.msg.error(data.Data);
        }
      });
  }
}
