import { Broadcaster } from './../../monitor.common.service';
import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';
@Component({
  selector: 'app-time-choice-panel',
  templateUrl: './time-choice-panel.component.html',
  styleUrls: ['./time-choice-panel.component.scss']
})
export class TimeChoicePanelComponent implements OnInit {
  @Input('time') time:string;
  @Output() selectOver = new EventEmitter<any>();
  visible:boolean=false;
  customTime:any=[]
  radioValue:string
  constructor(
  ) { }
  ngOnInit() {
    this.radioValue=this.time;
  }
 
  onOk(result: Date): void {
    this.selectOver.emit({
      type:7,
      time:result
    });
    this.customTime=result;
    this.visible=false;
  }
  ngModelChange(e){
    this.radioValue=e;
    if(e!=7){
      this.selectOver.emit({
        type:e
      });
      this.visible=false;
    }
  }
}
