export default class Track{
    constructor(target){
        this.target=target;
        this.parent=null;
        this.start=0;
        this.timeLen=5;
        this.loop=false
        this.keyMao=new Map();
    }
    update(t){
        const { keyMap,timeLen,target,loop,start }=this;

        let time=t-start;
        if(loop){
            time=time%timeLen;
        }
        for(const [key,fms] of keyMap){
            const last=fms.length-1;
            if(time<fms[0][0]){
                target[key]=fms[0][1]
            }else if(time>fms[last][0]){
                target[key]=fms[last][1]
            }else{
                target[key]=getValBetweenFms(time,fms,last)
            }
        }
    }
}


function getValBetweenFms(time,fms,last){
    for(let i=0;i<last;i++){
        const fm1=fms[i]
        const fm2=fms[i+1]
        if(time>=fm1[0]&&time<=fm2[0]){
            const dalta={
                x:fm2[0]-fm1[0],
                y:fm2[1]-fm1[1]
            }
            const k=dalta.y/dalta.x
            const b=fm1[1]-fm1[0]*k
            return k*time+b
        }
    }
}