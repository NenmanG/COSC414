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


class Circle {

    constructor(x, y, radius, colour){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.colour = colour;
        this.numVertices = 99; // num of fans
    }

    circleVertex(){
        let circleVertex = [
            this.x, this.y, 0.0 //circle center
        ];

        for(let i = 0; i <= this.numVertices; i++){
            circleVertex.push(Math.cos(i * 2 * Math.PI/this.numVertices) * this.radius + this.x);  //x
            circleVertex.push(Math.sin(i * 2 * Math.PI/this.numVertices) * this.radius + this.y);  //y
            circleVertex.push(0.0);                                                 //z
            
        }

        return circleVertex;
    }

    vertexColour(){
        let vertexColour = [
            this.colour[0],this.colour[1],this.colour[2] // each vertex colours
        ]; 

        for(let i = 0; i <= this.numVertices; i++){
            vertexColour.push(this.colour[0]);
            vertexColour.push(this.colour[1]);
            vertexColour.push(this.colour[2]);   
            
        }

        return vertexColour;
    }

    make(){
        // vertexData = [...]
        let cv = this.circleVertex();
        let vc = this.vertexColour();
        console.log(vc.length);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cv), gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vc), gl.STATIC_DRAW);
    
        var offset = 0;
        var totalNumVertices = 101;
    
        gl.drawArrays(gl.TRIANGLE_FAN, offset, totalNumVertices);

    }
}
// draw

var dish = new Circle(0,0,0.8,[0,0,0]);
dish.make();


class Bacteria {

    constructor(dish, colour){
        this.dish = dish;
        this.colour = colour;
    }

    make(){
        var index = Math.round((Math.random()*(300-3)+3)/3)*3;
        var x = this.dish.circleVertex()[index];
        var y = this.dish.circleVertex()[index+1];
        var bacteria = new Circle(x, y, 0.1, this.colour);
        bacteria.make();
    }
}

var bacteria1 = new Bacteria(dish, [0,1,0]);
bacteria1.make();





