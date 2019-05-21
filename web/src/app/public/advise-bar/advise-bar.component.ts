import { debounceTime } from 'rxjs/operators';
import { Component, OnInit, ViewChild, ElementRef, Renderer2, Input } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-advise-bar',
  templateUrl: './advise-bar.component.html',
  styleUrls: ['./advise-bar.component.scss']
})
export class AdviseBarComponent implements OnInit {
  @ViewChild("adviseContainer") adviseContainer: ElementRef;
  @Input("setting") setting:{
    title:string,
    subTitle:string,
    color:string,
    left:string,
    top:string,
    with:number
  };
  @Input("data") data:Array<{
    title:string,
    url:string,
    src:string
  }>;
  tid;
  sub0: Subscription;
  showAdvise: boolean = false;
  pre = {
    pageX: 0,
    pageY: 0,
  };
  cur = {
    pageX: 0,
    pageY: 0,
  };
  constructor(
    private render: Renderer2,
    private msg: NzMessageService
  ) { }

  ngOnInit() {
    this.render.listen(this.adviseContainer.nativeElement, "mousedown", (event) => {
      this.pre.pageX = Math.abs((event as any).pageX);
      this.pre.pageY = Math.abs((event as any).pageY);
      if (event.target.className == "advise-container")
        this.tid = 1;
    });
    this.render.listen(this.adviseContainer.nativeElement, "mouseup", (event) => {
      this.tid = 0;
    });

    this.render.listen(window, "mousemove", (event) => {
      if (this.tid) {
        this.cur.pageX = Math.abs((event as any).pageX);
        this.cur.pageY = Math.abs((event as any).pageY);
        let hd = this.cur.pageX - this.pre.pageX;
        let vd = this.cur.pageY - this.pre.pageY;
        this.render.setStyle(this.adviseContainer.nativeElement, "left", this.adviseContainer.nativeElement.offsetLeft + hd + "px");
        this.render.setStyle(this.adviseContainer.nativeElement, "top", this.adviseContainer.nativeElement.offsetTop + vd + "px");
        this.pre.pageX = Math.abs((event as any).pageX);
        this.pre.pageY = Math.abs((event as any).pageY);
      }
    });
  }

  show(event, flag) {
    event.stopPropagation();
    this.showAdvise = flag;
  }

  ngOnDestroy(): void {
    if (this.sub0)
      this.sub0.unsubscribe();
  }

}
