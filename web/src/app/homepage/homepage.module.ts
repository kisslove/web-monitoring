import { HomepageComponent } from './home-page/homepage.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  {path: '', component:HomepageComponent}
]; 
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes)
  ],
  declarations: [HomepageComponent]
})
export class HomepageModule { }
