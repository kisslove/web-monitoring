import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomHighchartComponent } from './custom-highchart/custom-highchart.component';
import { TimeChoicePanelComponent } from './time-choice-panel/time-choice-panel.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { LineProgressComponent } from './line-progress/line-progress.component';
import { AdviseBarComponent } from './advise-bar/advise-bar.component';
import { MonitorABlankDirective } from './monitor-a-blank.directive';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntdModule,
    FormsModule
  ],
  declarations: [CustomHighchartComponent, TimeChoicePanelComponent, LineProgressComponent, AdviseBarComponent, MonitorABlankDirective],
  exports:[CustomHighchartComponent,TimeChoicePanelComponent,LineProgressComponent,AdviseBarComponent,MonitorABlankDirective]
})
export class PublicModule { }
