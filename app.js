const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error('WebGL not supported');
}

// create buffer
const positionBuffer = gl.createBuffer();
const colourBuffer = gl.createBuffer();

// create vertex shader
// create fragment shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
precision lowp float;
attribute vec3 position;
attribute vec3 colour;
varying vec3 vColour;
void main() {
    vColour = colour;
    gl_Position = vec4(position, 1);
}
`);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
precision lowp float;
varying vec3 vColour;
void main() {
    gl_FragColor = vec4(vColour, 0.3);
}
`);
gl.compileShader(fragmentShader);

// create program
const program = gl.createProgram();

// attach shaders to program
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

gl.useProgram(program);

// enable vertex attributes
const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

const colourLocation = gl.getAttribLocation(program, `colour`);
gl.enableVertexAttribArray(colourLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
gl.vertexAttribPointer(colourLocation, 3, gl.FLOAT, false, 0, 0);



// draw

function makeCircle(x, y, radius, colour){
    // vertexData = [...]
    let circleVertex = [
        x, y, 0.0 //circle center
    ];

    let vertexColour = [
        colour[0],colour[1],colour[2]
    ]; // each vertex colours

    let numVertices = 99; // num of fans
  
    for(i = 0; i <= numVertices; i++){
        circleVertex.push(Math.cos(i * 2 * Math.PI/numVertices) * radius + x);  //x
        circleVertex.push(Math.sin(i * 2 * Math.PI/numVertices) * radius + y);  //y
        circleVertex.push(0.0);                                                 //z

        vertexColour.push(colour[0]);
        vertexColour.push(colour[1]);
        vertexColour.push(colour[2]);   
        
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertex), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColour), gl.STATIC_DRAW);

    var offset = 0;
    var totalNumVertices = 101;

    gl.drawArrays(gl.TRIANGLE_FAN, offset, totalNumVertices);
}

makeCircle(0,0,0.9,[0,0,0]);    //main circle 


