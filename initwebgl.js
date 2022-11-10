function initWebGL(gl, vertexSource, fragmentSource) {
    // 根据源代码创建顶点着色器
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    // 根据源代码创建片元着色器
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    // 创建 WebGLProgram 程序
    let program = createProgram(gl, vertexShader, fragmentShader);
    
    gl.program=program
}

function createProgram(gl, vertexShader, fragmentShader) {
    // 创建 program 对象
    let program = gl.createProgram();
    // 往 program 对象中传入 WebGLShader 对象
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // 链接 program
    gl.linkProgram(program);
    // 判断 program 是否链接成功

    gl.useProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    // 如果 program 链接失败，则打印错误信息
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function createShader(gl, type, source) {
    // 创建 shader 对象
    let shader = gl.createShader(type);
    // 往 shader 中传入源代码
    gl.shaderSource(shader, source);
    // 编译 shader
    gl.compileShader(shader);
    // 判断 shader 是否编译成功
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    // 如果编译失败，则打印错误信息
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

//线性比例尺
function ScaleLinear(ax, ay, bx, by) {
    const delta = {
      x: bx - ax,
      y: by - ay,
    };
    const k = delta.y / delta.x;
    const b = ay - ax * k;
    return function (x) {
      return k * x + b;
    };
  }
  
  /* 正弦函数 */
  function SinFn(a, Omega, phi) {
    return function (x) {
      return a * Math.sin(Omega * x + phi);
    }
  }
  
  /* GetIndexInGrid 
    在由一维数组建立的栅格矩阵中，基于行列获取元素的索引位置 
  */
  function GetIndexInGrid(w, size) {
    return function (x, y) {
      return (y * w + x) * size
    }
  }
  
  /* 对Image 加载事件的封装 */
  function imgPromise(img){
    return new Promise((resolve)=>{
      img.onload=function(){
          resolve(img);
      }
    });
  }
  
  /* 解析渐变节点 */
  function parseColorStops(source) {
      const stops = new Array(16).fill(-1);
      source.forEach(({ color, stop }, stopInd) => {
          let rgb = '';
          let ar = '';
          color.forEach((ele, ind) => {
            //1 1001 '1001' '001'
            const str = (ele + 1000).toString().slice(1);
            if (ind < 3) {
                rgb += str;
            } else {
                ar += str;
            }
          })
          ar += (Math.round(stop * 255) + 1000).toString().slice(1);
          stops[stopInd * 2] = rgb;
          stops[stopInd * 2 + 1] = ar;
      })
      return stops;
  }

export {initWebGL,ScaleLinear,SinFn};