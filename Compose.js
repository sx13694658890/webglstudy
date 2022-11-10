export default class Compose{
    constructor(){
        this.parent=null;
        this.chidlren=[];
    }
    add(obj){
        obj.parent=this;
        this.chidlren.push(obj)
    }
    update(t){
        this.chidlren,forEach(ele=>{
            ele.update(t)
        })
    }
}