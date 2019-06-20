import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-js-error-track',
  templateUrl: './js-error-track.component.html',
  styleUrls: ['./js-error-track.component.scss']
})
export class JsErrorTrackComponent implements OnInit {
  @Input("data") data;
  constructor() { }

  ngOnInit() {
    console.log(this.data);
    
  }

}
