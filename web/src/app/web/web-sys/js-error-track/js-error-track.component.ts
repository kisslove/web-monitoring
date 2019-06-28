import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { UploadXHRArgs, NzMessageService } from 'ng-zorro-antd';
import * as CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/mode/javascript/javascript';
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
  dataSet = [];
  codeMirrorEditor;
  constructor(
    private msg: NzMessageService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    setTimeout(() => {
      let myTextarea = document.getElementById('code');
      this.codeMirrorEditor = CodeMirror.fromTextArea(myTextarea, {
        mode: 'javascript',//编辑器语言
        theme: 'monokai', //编辑器主题
        extraKeys: { "Ctrl": "autocomplete" },//ctrl可以弹出选择项 
        lineNumbers: true//显示行号
      });
    });
  }

  resolve() {
    if (!this.currentFile.lineColumn) {
      this.msg.info('行号/列号不能为空');
      return;
    }
    let files = (document.getElementById("sourceMapFile") as any).files;
    if (files.length < 1) {
      this.msg.info('请上传对应*.map文件');
      return;
    }
    let [line, column] = this.currentFile.lineColumn.split(':');
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      const rawSourceMap = fileReader.result;
      // 查找
      (window as any).sourceMap.SourceMapConsumer.with(rawSourceMap, null, consumer => {
        let result = consumer.originalPositionFor({
          source: "./",
          line: +line,
          column: +column
        });
        let index = consumer._absoluteSources.indexOf(result.source);
        this.result = result;
        if (index != -1) {
          let sourceContent = consumer.sourcesContent[index];
          this.codeMirrorEditor.setValue(sourceContent);
        }
      });
    };
    fileReader.readAsText(files[0]);
  }

  getPath() {
    this.http.post("Monitor/JsErrorTrackPath", {
      createTime: this.data.createTime,
      onlineip: this.data.onlineip,
      os: this.data.os,
      pageWh: this.data.pageWh,
      ua: this.data.ua,
      bs: this.data.bs,
      appKey: this.data.appKey
    }).subscribe((data: any) => {
      if (data.IsSuccess) {
        data.Data.List.forEach(element => {
          if(element.type=='console'){
            element.cMsg=decodeURIComponent(element.cMsg);
          }
        });
        this.dataSet = data.Data.List;
      } else {
        this.msg.error("数据加载失败");
      }
    })
  }

}
