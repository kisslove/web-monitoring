import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {
  model={
    email:'',
    password:'',
  };
  model2={
    email:'',
    password:'',
  };
  isVisible_login:boolean=false;
  isVisible_register:boolean=false;
  constructor(
    private http:HttpClient
  ) { }

  ngOnInit() {
    let temp:any=document.querySelector("#video-index");
    temp.style=`width:100%;height:auto;`;
  }

  login(){
    this.http.post("login",this.model).subscribe((r)=>{
      console.log(r);
      
    })
  }

  register(){

  }

}
