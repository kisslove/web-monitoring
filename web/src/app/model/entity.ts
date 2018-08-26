export class UrlNav{
    value:string
    label:string
    isActive:boolean
    icon?:string
    constructor(label?:string,value?:string,isActive?:boolean,icon?:string){
        this.value = value;
        this.label = label;
        this.isActive = isActive;
        this.icon = icon;
    }
}

export class HighchartConfig{
    type:number
    ext:any
    extProps?:any
}
