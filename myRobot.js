var canvas, gl, program, vBuffer, cBuffer, vColor;
var proMat, mvMat, vPosition, endLower, endUpper;
var rotation, cubeFace, colors, modelViewMatrix, circleVert, circlePos, circle, animatedAngle, animate, angleDiff;


var BASE_HEIGHT = 1.5;
var BASE_WIDTH  = 3.0;
var LOWER_HEIGHT = 5.0;
var LOWER_WIDTH  = 0.5;
var UPPER_HEIGHT = 3.0;
var UPPER_WIDTH  = 0.4;

window.onload = function init() {
    console.log("this is working."); 
    canvas = document.getElementById('gl-canvas');
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) gl = canvas.getContext("experimental-webgl");
    if (!gl) alert("Browser doesn't support webgl");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 1, 1);
    gl.enable(gl.DEPTH_TEST);

    initVars();

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeFace), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition); 

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    proMat = gl.getUniformLocation(program, "proMat");

    projM = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv(proMat, false, flatten(projM));

    mvMat = gl.getUniformLocation(program, "mvMat");

    render();
};

window.addEventListener("click", function(event){
    onClick(event);
});

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    document.getElementById("slider1").oninput = function(event) {
        rotation[0] = Number(event.target.value);
    };
    document.getElementById("slider2").oninput = function(event) {
        rotation[1] = Number(event.target.value);
    };
    document.getElementById("slider3").oninput = function(event) {
        rotation[2] = Number(event.target.value);
    };

    console.log("rotation", rotation);


    if (animate){
        if (Math.round(rotation[1] * 10) == Math.round(animatedAngle[0] * 10)) {
            if (Math.round(rotation[2] * 10) == Math.round(animatedAngle[1] * 10)){
                animate = false;
            }
            else {
                rotation[2] += (angleDiff[1]/10);
                //console.log("rotation[2]", rotation[2]);
            }
        } 
        else {
            rotation[1] += (angleDiff[0]/10);
            //console.log("rotation[1]", rotation[1]);

        }

    }

    drawBase();

    drawLower();

    drawUpper();

    if (circle) drawCircle();

    requestAnimationFrame(render);

 }

 function initVars(){
    cubeFace = [];
    colors = [];
    modelViewMatrix = scalem(1, 1, 1);
    circlePos = [0, 0, 8];
    circle = false;
    animatedAngle = [0, 0];

    getCube();
    getColors();
    getCircle();

    rotation = [0, 0, 0];
 }

 function drawBase(){
    modelViewMatrix = rotate(rotation[0], 0, 1, 0 );
    var scale = scalem(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH);
    var ts = mult(translate(0.0, 0.5 * BASE_HEIGHT, 0.0 ), scale);
    var mv = mult(modelViewMatrix, ts);
    gl.uniformMatrix4fv(mvMat, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
 }

function drawLower(){
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, BASE_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(rotation[1], 0, 0, 1 ));
    var scale = scalem(LOWER_WIDTH, LOWER_HEIGHT, LOWER_WIDTH);
    var ts = mult(translate(0.0, 0.5 * LOWER_HEIGHT, 0.0 ), scale);
    var mv = mult(modelViewMatrix, ts);
    gl.uniformMatrix4fv(mvMat, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
 }

function drawUpper(){
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, LOWER_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(rotation[2], 0, 0, 1 ));
    var scale = scalem(UPPER_WIDTH, UPPER_HEIGHT, UPPER_WIDTH);
    var ts = mult(translate(0.0, 0.5 * UPPER_HEIGHT, 0.0 ), scale);
    var mv = mult(modelViewMatrix, ts);
    gl.uniformMatrix4fv(mvMat, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, 0, 36);
 }

function drawCircle(){
    modelViewMatrix = translate(circlePos);
    gl.uniformMatrix4fv(mvMat, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, 36, 202);
 }

function pushFaces(a, b, c, d, vertices){
    cubeFace.push(vertices[a]);
    cubeFace.push(vertices[b]);
    cubeFace.push(vertices[c]);
    cubeFace.push(vertices[a]);
    cubeFace.push(vertices[c]);
    cubeFace.push(vertices[d]);
}

function getCube() {
    var vert = [
        vec3(-0.5, -0.5,  0.5), //0
        vec3(-0.5,  0.5,  0.5), //1
        vec3(0.5,  0.5,  0.5), //2
        vec3(0.5, -0.5,  0.5), //3
        vec3(-0.5, -0.5, -0.5), //4
        vec3(-0.5,  0.5, -0.5), //5
        vec3(0.5,  0.5, -0.5), //6
        vec3(0.5, -0.5, -0.5) //7
    ]

    pushFaces(1, 0, 3, 2, vert);
    pushFaces(2, 3, 7, 6, vert);
    pushFaces(3, 0, 4, 7, vert);
    pushFaces(6, 5, 1, 2, vert);
    pushFaces(4, 5, 6, 7, vert);
    pushFaces(5, 4, 0, 1, vert);

}

function getColors(){
    colors.push([0.75, 0.45, 0.75]);
    colors.push([0.75, 0.45, 0.75]);
    colors.push([0.75, 0.45, 0.75]);
    colors.push([0.75, 0.45, 0.75]);
    colors.push([0.75, 0.45, 0.75]);
    colors.push([0.75, 0.45, 0.75]);

    colors.push([0.7, 0.4, 0.7]);
    colors.push([0.7, 0.4, 0.7]);
    colors.push([0.7, 0.4, 0.7]);
    colors.push([0.7, 0.4, 0.7]);
    colors.push([0.7, 0.4, 0.7]);
    colors.push([0.7, 0.4, 0.7]);

    colors.push([0.75, 0.4, 0.6]);
    colors.push([0.75, 0.4, 0.6]);
    colors.push([0.75, 0.4, 0.6]);
    colors.push([0.75, 0.4, 0.6]);
    colors.push([0.75, 0.4, 0.6]);
    colors.push([0.75, 0.4, 0.6]);

    colors.push([0.75, 0.45, 0.7]);
    colors.push([0.75, 0.45, 0.7]);
    colors.push([0.75, 0.45, 0.7]);
    colors.push([0.75, 0.45, 0.7]);
    colors.push([0.75, 0.45, 0.7]);
    colors.push([0.75, 0.45, 0.7]);

    colors.push([0.7, 0.4, 0.75]);
    colors.push([0.7, 0.4, 0.75]);
    colors.push([0.7, 0.4, 0.75]);
    colors.push([0.7, 0.4, 0.75]);
    colors.push([0.7, 0.4, 0.75]);
    colors.push([0.7, 0.4, 0.75]);

    colors.push([0.7, 0.4, 0.65]);
    colors.push([0.7, 0.4, 0.65]);
    colors.push([0.7, 0.4, 0.65]);
    colors.push([0.7, 0.4, 0.65]);
    colors.push([0.7, 0.4, 0.65]);
    colors.push([0.7, 0.4, 0.65]);

}

function getCircle(){
    var c = [1.0, 0.0, 0.0];
    var r = 0.3;
    cubeFace.push([0, 0, 0]);
    colors.push(c);
    for (i = 0; i <= 200; i++){
        cubeFace.push([
            r*Math.cos(2*i*Math.PI/200),
            r*Math.sin(2*i*Math.PI/200),
            0]
        );
        colors.push(c);
    }
}


function onClick(e){
    circle = true;
    circlePos[0] = (e.clientX - canvas.width/2)/30;
    circlePos[1] = (-e.clientY + canvas.height/2)/30;
    drawCircle();
    animation();
}

function animation(){
    var ag = getAngles();

    if (!ag[0] || !ag[1]) return; //stop moving arms
    var diff = circlePos[0] > 0 ? -1:1;
    animatedAngle[0] = ag[0] * diff;
    animatedAngle[1] = ag[1] * diff;
    angleDiff = [animatedAngle[0] - rotation[1], animatedAngle[1] - rotation[2]];

    console.log(rotation, animatedAngle, angleDiff);
    animate = true;

}

function getAngles(){
    var res = [];
    var a, b, c;
    a = Math.sqrt(circlePos[0] * circlePos[0] + (circlePos[1] - BASE_HEIGHT) * (circlePos[1] - BASE_HEIGHT));
    b = LOWER_HEIGHT;
    c = UPPER_HEIGHT;
    var ag1 = Math.acos((a * a + b * b - c * c)/(2 * a * b));
    var ag2 = Math.asin((circlePos[1] - BASE_HEIGHT)/a);

    res[0] = (Math.PI/2 - ag2 - ag1) * 180 / Math.PI; //lower angle
    res[1] = (Math.PI - Math.acos((c * c + b * b - a * a)/ (2 * c * b))) * 180 / Math.PI; // upper angle
    return res;
}

