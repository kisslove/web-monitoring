import { Directive, Host, HostListener, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[appMonitorABlank]'
})
export class MonitorABlankDirective {

  constructor(
    private elementRef: ElementRef
  ) { }

  @HostListener('click')
  onClick() { // 监听宿主元素的点击事件，设置元素背景色
    let temp = (window as any).__ml;
    if (temp && temp.focusClick) {
      temp.focusClick({
        title: this.elementRef.nativeElement.title,
        href: this.elementRef.nativeElement.href,
        text: this.elementRef.nativeElement.innerText
      });
    }
  }


}
