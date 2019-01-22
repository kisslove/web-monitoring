import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { UserService, Broadcaster } from './monitor.common.service';
import { Component, ElementRef, ViewChild, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  userName = null;
  unsubscribe = {
    sub0: null
  };
  showTips:boolean=true;
  thanksList=[{
    name:'*环',
    notes:'请问可否开源上报js...'
  },{
    name:'*子',
    notes:'膜拜大佬，前端监...'
  }]
  constructor(
    private user: UserService,
    private router: Router,
    private msg: NzMessageService,
    private http: HttpClient,
    private cookie: CookieService,
    private broadcaster: Broadcaster

  ) {

  }
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
    this.http.post("user/logout", {}, {
      params: {
        id: this.user.getUserId()
      }
    }).subscribe((data: any) => {
      if (data.IsSuccess) {
        this.cookie.delete("user");
        this.userName = null;
        this.router.navigate(['home']);
      } else {
        this.msg.error(data.Data);
      }
    })
  }

}
