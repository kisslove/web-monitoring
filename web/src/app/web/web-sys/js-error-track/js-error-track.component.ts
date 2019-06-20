import { Component, OnInit, Input } from '@angular/core';
import { UploadXHRArgs, NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-js-error-track',
  templateUrl: './js-error-track.component.html',
  styleUrls: ['./js-error-track.component.scss']
})
export class JsErrorTrackComponent implements OnInit {
  @Input("data") data;
  currentFile = {
    lineColumn: ''
  };
  result;
  constructor(
    private msg: NzMessageService
  ) { }

  ngOnInit() {
  }

  resolve() {
    console.log(this.currentFile);
    if (!this.currentFile.lineColumn) {
      this.msg.info('不含有行号：列号');
      return;
    }
    let files = (document.getElementById("sourceMapFile") as any).files;
    if (files.length < 1) {
      this.msg.info('请上传对应map文件');
      return;
    }
    let [line, column] = this.currentFile.lineColumn.split(':');
    const fileReader = new FileReader();
    fileReader.onloadend = ()=> {
      const rawSourceMap = fileReader.result;
      // 查找
      (window as any).sourceMap.SourceMapConsumer.with(rawSourceMap, null, consumer => {
        let result = consumer.originalPositionFor({
          source: "./",
          line: +line,
          column: +column
        });
        this.result=result;
        console.log(result);
      });
    };
    fileReader.readAsText(files[0]);
  }

}
