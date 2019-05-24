import { PublicModule } from './../public/public.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { HomepageComponent } from './home-page/homepage.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
const routes: Routes = [
  {path: '', component:HomepageComponent}
]; 
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PublicModule,
    NgZorroAntdModule,
    RouterModule.forChild(routes)
  ],
  declarations: [HomepageComponent]
})
export class HomepageModule { }
