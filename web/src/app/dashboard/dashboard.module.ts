import { PublicModule } from './../public/public.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { SysListComponent } from './sys-list/sys-list.component';
const routes: Routes = [
  {path: '', component:SysListComponent}
]; 
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgZorroAntdModule,
    PublicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SysListComponent]
})
export class DashboardModule { }