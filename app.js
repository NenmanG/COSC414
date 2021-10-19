const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

var bacteria = [];
var totalBacteria = 10;
var bacteriaColours = [
    [0.64,0.56,0.83],
    [0.77,0.86,0.64],
    [0.55,0.02,0.24],
    [0.96,0.94,0.72],
    [0.97,0.34,0.22],
    [0.06,0.64,0.69],
    [0.88,0.55,0.47],
    [0.23,0.27,0.36],
    [0.94,0.55,0.29],
    [0.65,0.27,0.34]

];
var start = true;
var chance = 2;
var points = 0;
var poisoned = 0;

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
    gl_FragColor = vec4(vColour, 1);
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

//calculate distance between two circles center. Combine this distance with the radius to determine if circles centers clash with one another
function clash(x1, y1, r1, x2, y2, r2) {
    var xDist = x2-x1;
    var yDist = y2-y1;
    var totalDistance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));// Pythagorean theorem

    if(totalDistance - (r1+r2) < 0) {
        return true;
    }

    return false;
}

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
            circleVertex.push(0.0);                                                                //z
            
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
        
        let cv = this.circleVertex();   // vertexData = [...]
        let vc = this.vertexColour();   // colorData = [...]
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cv), gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vc), gl.STATIC_DRAW);
    
        var offset = 0;
        var totalNumVertices = 101;
    
        gl.drawArrays(gl.TRIANGLE_FAN, offset, totalNumVertices);// draw

    }
}


class Bacterium {
    x;
    y;
    r; //radius

    constructor(dish, colour){
        this.dish = dish;   //dish to get points on circumference from
        this.colour = colour;
    }

    get x (){
        return this.x;
    }
    get y (){
        return this.y;
    }
    get r (){
        return this.r;
    }

    initialise(){
        var index = Math.round((Math.random()*(300-3)+3)/3)*3; //get random point x on the circle circumference i.e. random point x in circle vertex [...]
        this.x = this.dish.circleVertex()[index];
        this.y = this.dish.circleVertex()[index+1];
        this.r = 0.05;  //starting radius of all bacteria

        // Variable to ensure no infinite loop is created
        var trial = 0;

        // Loop through all Bacteria to ensure no clash on initialisation
        for (var i = 0; i < bacteria.length; i++) {
            // Error check to not break the game if the bacteria cover the whole game surface.
            if(trial > 500) {
                console.log("No area for new bacteria to spawn");
                break;
            }

            // If theres a collision with a specific object, the variables need to be randomized again
            if (clash(this.x, this.y, 0.05, bacteria[i].x, bacteria[i].y, bacteria[i].r)) {

                var index = Math.round((Math.random()*(300-3)+3)/3)*3; //get random point x on the circle circumference  i.e. random point x in circle vertex [...]
                this.x = this.dish.circleVertex()[index];
                this.y = this.dish.circleVertex()[index+1];
                trial++;
                i = -1;
            }
        }
        this.r = 0.05;
        this.alive = true;
        
    }

    update(){
        if(this.alive) {
            // at max radius of 0.2 poison the bacteria and player loses a chance
            if(this.r > 0.2) {
                chance--;
                this.poison(bacteria.indexOf(this));
            } else {
                // Increase the size of each bacteria by 0.0003 each loop
                    this.r += 0.0003;
            }
            // Draw
            var bacterium = new Circle(this.x, this.y, this.r, this.colour);
            bacterium.make();
        }
    }

    poison(i){
    
        this.r = 0;
        this.x = 0;
        this.y = 0;
        this.alive = false;
        
        bacteria.splice(i,1);

    }
}

//create new petri dish
var dish = new Circle(0,0,0.8,[0.95,0.95,0.95]);

//create bacteria and load them into array
for(var i = 0; i<totalBacteria; i++){
    bacteria.push( new Bacterium(dish, bacteriaColours[i]) );
    bacteria[i].initialise();
}

canvas.onmousedown = function click(e) {
    let x = e.clientX;
    let y = e.clientY;

    const rect = e.target.getBoundingClientRect();
    //Convert default canvas coords to webgl vector coords
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    // Loop through all bacteria and check if you clicked within the radius of any

    for(let i in bacteria) {
        
        if(clash(x, y, 0, bacteria[i].x, bacteria[i].y, bacteria[i].r)){
            
            points += Math.round(0.5/bacteria[i].r); //points attainable reduce as radius increases to emphasize effect of delay in clicking
            poisoned++;
            bacteria[i].poison(i);
            
            // Break ensures you can't click multiple bacteria at once
            break;
         }
    }
}



function loop() {
    this.dish.make();//draw game petri dish

    document.getElementById('score').innerHTML = points;
    document.getElementById('chances').innerHTML = chance;
    document.getElementById('poisoned').innerHTML = poisoned;

    if(chance > 0) {
        for (let i in bacteria) {
                bacteria[i].update();
                if (chance <= 0) { //game lose condition
                    
                    document.getElementById('win-lose').innerHTML = "LOSER! BACTERIA GREW TOO BIG!";
                    break;
                }
            }
        if(bacteria.length===0){ //game win condition
            document.getElementById('win-lose').innerHTML = "WINNER! YOU POISONED ALL THE BACTERIA BEFORE THEY GREW TOO BIG!";
        }
        
      }
   
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);



