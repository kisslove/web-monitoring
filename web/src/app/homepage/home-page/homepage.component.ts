import { debounceTime } from "rxjs/operators";
import { Broadcaster } from "./../../monitor.common.service";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit, Renderer2 } from "@angular/core";
import * as CryptoJS from "crypto-js";
import { UserService } from "../../monitor.common.service";
import { Subscription, fromEvent } from "rxjs";

interface ICardProps {
  avatar: string;
  title: string;
  description: string;
}

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.scss"],
})
export class HomepageComponent implements OnInit {
  _KEY: "28756942659325487412569845231586"; //32位
  _IV: "8536874512548456"; //16位
  model = {
    email: "",
    password: "",
  };
  model2 = {
    email: "",
    password: "",
  };
  bussinessItems: Array<ICardProps> = [];
  whoUsedItems: Array<ICardProps> = [];
  usedProcessItems: Array<ICardProps> = [];
  proItems: Array<ICardProps> = [];
  isVisible_login: boolean = false;
  isVisible_register: boolean = false;
  isLogin: boolean = false;
  unsubscribe: Subscription;
  isAdmin = false;
  constructor(
    private http: HttpClient,
    private msg: NzMessageService,
    private router: Router,
    private cookie: CookieService,
    private user: UserService,
    private broadcaster: Broadcaster,
    private render: Renderer2
  ) {}

  ngOnInit() {
    this.isAdmin = this.user.isAdmin();
    setTimeout(() => {
      this.isLogin = this.user.getToken() ? true : false;
    }, 1000);

    this.proItems = [
      {
        avatar: "safe.png",
        title: "无业务侵入影响",
        description:
          "项目使用探针植入，自动上报数据，不影响业务系统使用。",
      },
      {
        avatar: "multi.png",
        title: "捕获采集指标丰富",
        description:
          "日活跃、用户行为记录、访问日志、JS错误日志、API请求详情、访问性能评估。",
      },
      {
        avatar: "q.png",
        title: "快速定位问题",
        description:
          "提供出错上下文，重现错误场景。",
      },
      {
        avatar: "alarm.png",
        title: "智能报警服务",
        description:
          "灵活设置报警阈值，即时发现问题，不影响用户正常使用。",
      },
    ];

    this.bussinessItems = [
      {
        avatar: "",
        title: "前端监控平台个性化定制",
        description:
          "根据用户要求定制开发前端监控系统，个性化设置图表分析，数据展示，助你及时解决线上问题。(微信/QQ:676022504)",
      },
      {
        avatar: "",
        title: "个人/企业网站开发",
        description:
          "专注各类软件开发，打造安全优质的网络平台，价格实惠，低于同类竞品。",
      },
      {
        avatar: "",
        title: "小程序开发",
        description: "引流新渠道，无需下载，扫码即可使用。",
      },
      {
        avatar: "",
        title: "前/后端/架构咨询服务",
        description:
          "专注解决开发、线上过程中的各种疑难问题，服务费用低至10元。（微信/QQ:676022504）",
      },
    ];

    this.whoUsedItems = [
      {
        avatar: "m.png",
        title: "前端性能监控平台",
        description:
          "从不同维度去统计用户真实访问站点的情况，再现用户访问场景，帮助你快速定位问题。",
      },
      {
        avatar: "m.png",
        title: "cnbook",
        description: "【Kindle中国】_Amazon Kindle 完全购买攻略。",
      },
      {
        avatar: "m.png",
        title: "bboss",
        description:
          "bboss是一个j2ee开源框架，为企业级应用开发提供一站式解决方案，并能有效地支撑移动应用开发。",
      },
      {
        avatar: "m.png",
        title: "酷娃利息对比计算工具",
        description: "一款帮你选择贷款方式的多功能利息计算工具。",
      },
      {
        avatar: "m.png",
        title: "IP转换工具",
        description:
          "可以快速，准确，可靠的将IP转换成位置的工具，并对外提供接口。",
      },
      {
        avatar: "m.png",
        title: "面试一点通",
        description:
          "全球首个面试资源社区,收录全网面试题,涵盖IT.互联网、金融.财会、娱乐传媒、公务员、教育培训、法律行业、市场营销、职能行政...等等行业。",
      },
      {
        avatar: "m.png",
        title: "小贝找房",
        description: "新房、二手房专业咨询网站。",
      },
      {
        avatar: "m.png",
        title: "More",
        description: "更多私有项目入驻。",
      },
    ];

    this.usedProcessItems = [
      {
        avatar: "app.png",
        title: "步骤1：创建应用",
        description: "点击立即体验，进入应用中心，创建应用。",
      },
      {
        avatar: "SDK.png",
        title: "步骤2：复制探针",
        description: "选择需要监控的指标，复制探针到项目。",
      },
      {
        avatar: "data.png",
        title: "步骤3：开启监控",
        description: "进入应用详情，查看各项指标数据。",
      },
    ];
  }

  _resizePageHeight() {
    this.render.setStyle(
      document.querySelector("#home-section"),
      "height",
      document.body.clientHeight - 50 + "px"
    );
  }

  login() {
    let pwd = this.encrypt(this.model.password);
    this.http
      .post("User/login", {
        email: this.model.email,
        password: pwd,
      })
      .subscribe((r: any) => {
        if (r.IsSuccess) {
          this.cookie.set(
            "user",
            JSON.stringify(r.Data),
            new Date(new Date().setMonth(new Date().getMonth() + 1))
          );
          this.broadcaster.broadcast("refreshUser");
          this.router.navigate(["dashboard"]);
        } else {
          this.msg.error(r.Data, { nzDuration: 4000 });
        }
      });
  }

  ngOnDestroy(): void {
    // this.unsubscribe.unsubscribe();
  }

  register() {
    let pwd = this.encrypt(this.model2.password);
    this.http
      .post("User/register", {
        email: this.model2.email,
        password: pwd,
      })
      .subscribe((r: any) => {
        if (r.IsSuccess) {
          this.cookie.set(
            "user",
            JSON.stringify(r.Data),
            new Date(new Date().setMonth(new Date().getMonth() + 1))
          );
          this.broadcaster.broadcast("refreshUser");
          this.router.navigate(["dashboard"]);
        } else {
          this.msg.error(r.Data, { nzDuration: 4000 });
        }
      });
  }

  private encrypt(str) {
    var key = CryptoJS.enc.Utf8.parse(this._KEY);
    var iv = CryptoJS.enc.Utf8.parse(this._IV);
    var encrypted = "";
    var srcs = CryptoJS.enc.Utf8.parse(str);
    encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).ciphertext;

    return encrypted.toString();
  }
}
