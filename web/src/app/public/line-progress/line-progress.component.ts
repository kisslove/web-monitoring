import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import * as _ from 'lodash';
@Component({
  selector: 'app-line-progress',
  templateUrl: './line-progress.component.html',
  styleUrls: ['./line-progress.component.scss']
})
export class LineProgressComponent implements OnInit {
  @Input('data') data;
  globalColors = [
    '#F0574D', '#C55661', '#9A6686', '#866F99', '#D48E4A', '#BC8D58', '#908D74' , '#588D99', '#378DAE', '#3ADDFA', '#46C4D9', '#AB8173', '#C3715A', '#EF5630', '#716ded', '#4b7696', '#4b968a', '#69bf8c', '#7abf69', '#aebf69', '#bf9d69', '#bf6969', '#bf699d', '#ae69bf', '#7a69bf', '#698cbf', '#69bfbf', '#6ccc6f', '#a2cc6c', '#ccbc6c', '#cc826c', '#cc6cc9', '#966ccc', '#32CD32', '#6c7ccc', '#6cb6cc', '#6ccca9'
  ];
  lineData = [];
  constructor() {
  }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data.currentValue && changes.data.currentValue != changes.data.previousValue) {
      this.renderLine();
    }
  }
  private renderLine() {
    let totalCount = 0;
    _.each(this.data, (d) => {
      totalCount += d.val;
    });
    let frontDataTotal = 0;
    let zeroCount=0;
    _.each(this.data, (d, index) => {
      d.marginL = (frontDataTotal / totalCount) == 0 ? 0 : (frontDataTotal / totalCount).toFixed(3);
      d.percent = (d.val / totalCount) == 0 ? 0 : (d.val / totalCount).toFixed(3);
      if(d.percent>0.5){
        d.percent= d.percent-0.01;
      }
      d.color = this.globalColors[index];
      frontDataTotal += d.val;
      // d.percent = index == this.data.length - 1 ? (d.percent - zeroCount*0.002) : d.percent;
    });
    _.each(this.data, (val, index) => {
      setTimeout(() => {
        this.lineData[index] = val;
      }, (1 + index) * 100 + 500);
    });
  }

}
