
import { BackendLogComponent } from './web-sys/backend-log/backend-log.component';
import { PublicModule } from './../public/public.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { WebSysComponent } from './web-sys/web-sys.component';
import { SysIndexComponent } from './web-sys/sys-index/sys-index.component';
import { SysSettingComponent } from './web-sys/sys-setting/sys-setting.component';
import { VisitPageComponent } from './web-sys/visit-page/visit-page.component';
import { VisitSpeedComponent } from './web-sys/visit-speed/visit-speed.component';
import { JsErrorComponent } from './web-sys/js-error/js-error.component';
import { ApiRequestComponent } from './web-sys/api-request/api-request.component';
import { VisitDetailsComponent } from './web-sys/visit-details/visit-details.component';
import { VisitGeoComponent } from './web-sys/visit-geo/visit-geo.component';
import { VisitOsComponent } from './web-sys/visit-os/visit-os.component';
import { ResourceLoadDetailsComponent } from './web-sys/resource-load-details/resource-load-details.component';
import { UserPathComponent } from './web-sys/user-path/user-path.component';
import { JsErrorTrackComponent } from './web-sys/js-error-track/js-error-track.component';
const routes: Routes = [
  {
    path: '', component: WebSysComponent, children: [
      { path: '', redirectTo: 'index' },
      //应用总览
      { path: 'index', component: SysIndexComponent },
      // 设置
      { path: 'setting', component: SysSettingComponent },
      // 用户访问路径
      { path: 'userPath', component: UserPathComponent },
      // 访问页面
      { path: 'visitPage', component: VisitPageComponent },
      // 访问速度
      { path: 'visitSpeed', component: VisitSpeedComponent },
      // 访问明细
      { path: 'visitDetails', component: VisitDetailsComponent },
      // js错误
      { path: 'jsError', component: JsErrorComponent },
      // api请求
      { path: 'apiReq', component: ApiRequestComponent },
      // 地理
      { path: 'visitGeo', component: VisitGeoComponent },
      // 终端
      { path: 'visitOs', component: VisitOsComponent },
       // 资源加载详情
       { path: 'resourceDetails', component: ResourceLoadDetailsComponent },
      // 后端日志
      { path: 'backendLog', component: BackendLogComponent }
    ]
  }
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgZorroAntdModule,
    RouterModule.forChild(routes),
    PublicModule
  ],
  entryComponents:[JsErrorTrackComponent],
  declarations: [BackendLogComponent,WebSysComponent, SysIndexComponent, SysSettingComponent, VisitPageComponent, VisitSpeedComponent, JsErrorComponent, ApiRequestComponent, ResourceLoadDetailsComponent, VisitDetailsComponent, VisitGeoComponent, VisitOsComponent, UserPathComponent, JsErrorTrackComponent]
})
export class WebModule { }