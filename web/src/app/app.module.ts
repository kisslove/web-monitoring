import { BrowserModule } from '@angular/platform-browser';
import { NgModule,ErrorHandler } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { NgZorroAntdModule,NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
registerLocaleData(zh);

import { JwtInterceptorService, Broadcaster, ConfigService } from './monitor.common.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
declare var window:any
const routes: Routes = [
  { path: '', pathMatch:'full',redirectTo:'dashboard' },
  { path: 'dashboard', loadChildren:'app/dashboard/dashboard.module#DashboardModule' },
  { path: 'sys/:appKey', loadChildren:'app/web/web.module#WebModule' }
];
export class MyErrorHandler implements ErrorHandler {
  handleError(error) {
    console.error(error);
    window.__ml && window.__ml.error && window.__ml.error(error.stack || error);
  }
}
@NgModule({
  declarations: [
    AppComponent
  ], 
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    NgZorroAntdModule.forRoot()
  ],
  providers: [{ provide: NZ_I18N, useValue: zh_CN },{ provide: ErrorHandler, useClass: MyErrorHandler },ConfigService, { provide: LocationStrategy, useClass: HashLocationStrategy }, { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true }, Broadcaster],
  bootstrap: [AppComponent]
})
export class AppModule { }
