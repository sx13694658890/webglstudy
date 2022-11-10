import {Matrix4,Quaternion,Vector3,Vector4} from "./js/three.js"
const defAttr=()=>({
    gl:null,
    vertices:[],
    geoData:[],
    size:2,
    attrName:'a_Position',
    count:0,
    types:['POINTS'],
    circleDot:false,
    u_IsPOINTS:null,
    speed:0,
    source:[],
  sourceSize:0,
  elementBytes:4,
  categorySize: 0,
  attributes: {},
  uniforms: {},
  })
  export default class Poly{
    constructor(attr){
      Object.assign(this,defAttr(),attr)
      this.init()
    }
    init(){
      const {attrName,size,gl}=this
      if(!gl){return}
      this.calculateSourceSize()
    this.updateAttribute();
    this.updateUniform();
     
    }
    calculateSourceSize() {
      const {attributes, elementBytes,source } = this
      let categorySize = 0
      Object.values(attributes).forEach(ele => {
          const { size, index } = ele
          categorySize += size
          ele.byteIndex=index*elementBytes
      })
      this.categorySize = categorySize
      this.categoryBytes=categorySize*elementBytes
      console.log(source,"1232312");
      this.sourceSize = source.length / categorySize
  }
  updateAttribute() {
    const { gl, attributes, categoryBytes, source } = this
    const sourceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(source), gl.STATIC_DRAW)
    for (let [key, { size, byteIndex }] of Object.entries(attributes)) {
      
        const attr = gl.getAttribLocation(gl.program, key)
        gl.vertexAttribPointer(
            attr,
            size,
            gl.FLOAT,
            false,
            categoryBytes,
            byteIndex
        )
        gl.enableVertexAttribArray(attr)
    }
}
updateUniform() {
  const {gl,uniforms}=this
  for (let [key, val] of Object.entries(uniforms)) {
      const { type, value } = val
      console.log(type,value,"........")
      console.log("KEY",key);
      const u = gl.getUniformLocation(gl.program, key)
      if (type.includes('Matrix')) {
          gl[type](u,false,value)
      } else {
          gl[type](u,value)
      }
  }
}
    addVertice(...params){
      this.vertices.push(...params)
      this.updateBuffer()
    }
    popVertice(){
       
      const {vertices,size}=this
      const len=vertices.length
      vertices.splice(len-size,len)
      this.updateCount()
    }
    setVertice(ind,...params){
      const {vertices,size}=this
      const i=ind*size
      params.forEach((param,paramInd)=>{
        vertices[i+paramInd]=param
      })
    }
    updateBuffer(){
      const {gl,vertices}=this
     
      const source=new Float32Array(vertices)
      //元素字节数
      const elementsBytes=source.BYTES_PER_ELEMENT
      // 系列尺寸
      const verticeSize=3
      const colorsize=4
      //类目尺寸
      const categorySize=verticeSize+colorsize
      // 类目字节数
      const categoryBytes=categorySize*elementsBytes
      // 系列字节索引位置
      const verticeIndex=0
      const colorIndex=verticeSize*elementsBytes
      // 顶点总数
      const sourceSize=source.length/categorySize
      
      this.updateCount(sourceSize)
      gl.bufferData(gl.ARRAY_BUFFER,source,gl.STATIC_DRAW)
      return {
        elementsBytes,
        verticeSize,
        colorsize,
        categoryBytes,
        verticeIndex,
        colorIndex,
        sourceSize
      }
    }
    updateCount(sourceSize){
      this.count=sourceSize
    }
    updateVertices(params){
      const {geoData}=this
      const vertices=[]
      geoData.forEach(data=>{
        params.forEach(key=>{
          vertices.push(data[key])
        })
      })
      this.vertices=vertices
    }
    draw(types=this.types){
      const {u_IsPOINTS,circleDot,gl,sourceSize}=this
      gl.clear(gl.COLOR_BUFFER_BIT)
      for(let type of types){
        circleDot&& gl.uniform1f(this.u_IsPOINTS,type==="POINTS")
        gl.drawArrays(gl[type],0,sourceSize);
        
      }
    }
    translate(x,y,z,w){
      const {u_Translation,gl,count,u_CosB,u_SinB}=this
        gl.uniform4f(this.u_Translation,x,y,z,w)
        
        gl.clear(gl.COLOR_BUFFER_BIT)
        this.draw()
       
    }
    rotate(du){
      const {gl,u_CosB,u_SinB}=this
      gl.uniform1f(u_CosB,Math.cos(du))
      gl.uniform1f(u_SinB,Math.sin(du))
      gl.clear(gl.COLOR_BUFFER_BIT)
      this.draw()
    }
    matrix(){
      const {gl,u_Matrix}=this
      const [bx,by]=[0.2,0.2];
      const [cx,cy]=[0.5,0.1];

      const bm=new Matrix4().set(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        bx,by,0,1,
      )
      const cm=new Matrix4().set(
        Math.cos(Math.PI/6),-Math.sin(Math.PI/6),0,0,
        Math.cos(Math.PI/6),Math.cos(Math.PI/6),0,0,
        0,0,0,0,
        cx,cy,0,1
       
      )
      const dm=cm.multiply(bm)
      gl.uniformMatrix4fv(u_Matrix, false, dm.elements)
      gl.clear(gl.COLOR_BUFFER_BIT)
      this.draw()
    }
    matrixMixin(){
      const {gl,u_Matrix}=this
      const [bx,by]=[0.5,0.2];
      const [cx,cy]=[0.1,0.2];
      const mr=new Matrix4();
      const ms=new Matrix4();
      mr.makeRotationZ(Math.PI/2);
      const mt=new Matrix4();
      mt.makeTranslation(0.5,2,0);
      ms.makeScale(1,1,1)
      const bm=new Matrix4().set(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        bx,by,0,1,
      )
      const cm=new Matrix4().set(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        cx,cy,0,1,
      )
      const dm=mr.multiply(ms).multiply(mt)
      gl.uniformMatrix4fv(u_Matrix, false, dm.elements)
      gl.clear(gl.COLOR_BUFFER_BIT)
      this.draw()
    }
    compose(){
      const {gl,u_Matrix}=this
      const mt=new Matrix4();
       const ps=new Vector4(3,1,0,0);
       mt.makeTranslation(0.4,0,0);
       const rot=new Quaternion();
       rot.setFromAxisAngle(new Vector3(0,0,1),Math.PI);
       const sca=new Vector3(1,1,1)
       const matrix=new Matrix4();
       matrix.compose(ps,rot,sca)
       gl.uniformMatrix4fv(u_Matrix, false,matrix.elements)
       gl.clear(gl.COLOR_BUFFER_BIT)
       this.draw()
    }
    viewMatrix(){
      const {gl,u_Matrix}=this
     var  m2=[
        Math.cos(Math.PI/6),-Math.sin(Math.PI/6),0,0,
        Math.cos(Math.PI/6),Math.cos(Math.PI/6),0,0,
        0,0,1,0,
        0,0,0,1,
      ]
      const dm=m2
      gl.uniformMatrix4fv(u_Matrix, false, dm.elements)
      gl.clear(gl.COLOR_BUFFER_BIT)
      this.draw()
    }
    rectVieMatrix(){
      const {gl,u_Matrix}=this
      const viewMatrix = this.getViewMatrix(
        new Vector3(0.6, 0.1, 0.4),
        new Vector3(0, 0.5, 0.2),
        new Vector3(0, 1, 0)
      )
      gl.uniformMatrix4fv(u_Matrix, false, viewMatrix)
      gl.clear(gl.COLOR_BUFFER_BIT)
      this.draw()
    }
    getViewMatrix(e, t, u) {
      //基向量c，视线
      const c = new Vector3().subVectors(e, t).normalize()
      //基向量a，视线和上方向的垂线
      const a = new Vector3().crossVectors(u, c).normalize()
      //基向量b，修正上方向
      const b = new Vector3().crossVectors(c, a).normalize()
      //正交旋转矩阵
      const mr = new Matrix4().set(
        ...a, 0,
        ...b, 0,
        -c.x, -c.y, -c.z, 0,
        0, 0, 0, 1
      )
      //位移矩阵
      const mt = new Matrix4().set(
        1, 0, 0, -e.x,
        0, 1, 0, -e.y,
        0, 0, 1, -e.z,
        0, 0, 0, 1
      )
      return mr.multiply(mt).elements
    }
    modelmatrix(){
      const {gl,u_Matrix,u_Modelmatrix}=this
      this.model=new Matrix4()
     
      let speedx=0,
      speedy=0,
      speedz=0,
      minY=-0.7,
      maxY=0.7,
      y=maxY,
      vy=0,
      ay=-0.001,
      bounce=1
      setInterval(()=>{
        speedx+=0.01
        speedy+=0.01
        speedz+=0.02
        vy+=ay,
        y+=vy
        
        if(this.model.elements[13]<minY){
            y=minY
            vy*=-bounce
        }
        this.model.makeRotationX(Math.cos(speedx))
        this.model.makeRotationY(Math.sin(speedy))
        this.model.makeRotationZ(speedz)
        this.model.setPosition(0,y,0)
        
        const view=new Matrix4().lookAt(
          new Vector3(0.7, 0.4, 2),
          new Vector3(0, 0, 0),
          new Vector3(0, 1, 0)
        )
        
        gl.uniformMatrix4fv(u_Modelmatrix, false,this.model.elements )
        gl.uniformMatrix4fv(u_Matrix, false, view.elements)
        gl.clear(gl.COLOR_BUFFER_BIT)
        this.draw()
      },20)  
    }
    bolangmatrix(){
      
      
    }
    wenli(){
      const {gl,types,count,u_Matrix,a_Color}=this
      const colors=new Float32Array([
        0,0,1,1,
        0,1,0,1,
        1,0,0,1])
      const colorBuffer=gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer)
      gl.bufferData(gl.ARRAY_BUFFER,colors,gl.STATIC_DRAW)
      
      
    }
   
  }