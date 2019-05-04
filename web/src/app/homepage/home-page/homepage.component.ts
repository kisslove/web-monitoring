import { Broadcaster } from './../../monitor.common.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as CryptoJS from "crypto-js";
import { UserService } from '../../monitor.common.service';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  _KEY: "28756942659325487412569845231586" //32位
  _IV: "8536874512548456" //16位
  model = {
    email: '',
    password: '',
  };
  model2 = {
    email: '',
    password: '',
  };
  isVisible_login: boolean = false;
  isVisible_register: boolean = false;
  isLogin:boolean=false;
  constructor(
    private http: HttpClient,
    private msg: NzMessageService,
    private router: Router,
    private cookie: CookieService,
    private user:UserService,
    private broadcaster:Broadcaster
  ) { }

  ngOnInit() {
    setTimeout(()=>{
      this.isLogin=this.user.getToken()?true:false;
    },1000)
    let temp: any = document.querySelector("#home-section");
    temp.style = `width:100%;height:${document.body.clientHeight-50}px;`;
  }
 
  login() {
    let pwd = this.encrypt(this.model.password);
    this.http.post("User/login", {
      email: this.model.email,
      password: pwd
    }).subscribe((r: any) => {
      if (r.IsSuccess) {
        this.cookie.set("user", JSON.stringify(r.Data), new Date(new Date().setMonth(new Date().getMonth() + 1)));
        this.broadcaster.broadcast("refreshUser");
        this.router.navigate(['dashboard']);
      } else {
        this.msg.error(r.Data, { nzDuration: 4000 });
      }
    })
  }

  // register() {
  //   let pwd = this.encrypt(this.model2.password);
  //   this.http.post("User/register", {
  //     email: this.model2.email,
  //     password: pwd
  //   }).subscribe((r: any) => {
  //     if (r.IsSuccess) {
  //       this.cookie.set("user", JSON.stringify(r.Data), new Date(new Date().setMonth(new Date().getMonth() + 1)));
  //       this.broadcaster.broadcast("refreshUser");
  //       this.router.navigate(['dashboard']);
  //     } else {
  //       this.msg.error(r.Data, { nzDuration: 4000 });
  //     }
  //   })
  // }

  private encrypt(str) {
    var key = CryptoJS.enc.Utf8.parse(this._KEY);
    var iv = CryptoJS.enc.Utf8.parse(this._IV);
    var encrypted = '';
    var srcs = CryptoJS.enc.Utf8.parse(str);
    encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).ciphertext;

    return encrypted.toString();
  }

}
