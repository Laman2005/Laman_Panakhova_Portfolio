/*
    Copyright (c) <2012-2015> Ed Angel and Dave Shreiner
    Code sample for CSCI 2408 Computer Graphics 
    (c)2022-24 by Araz Yusubov 
    DISCLAIMER: All code examples we will look at are quick hacks intended to present working prototypes.
    Hence they do not follow best practice of programming or software engineering.    
*/


// REFERENCES THAT WERE USED FOR FIXATION OF "Change the program so it fixes the issue with perspective projection" TASK: 

// https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html

// https://learnopengl.com/Getting-started/Camera 




"use strict";
// The purpose of "use strict" is to indicate that the code should be executed in "strict mode".
// With strict mode, you can not, for example, use undeclared variables.

var canvas;
var gl;

var fileopen;
// An Object instance to load and display a 3D model
var model;

// Arrays for storing all triangle data 
var triangleVertices;
var triangleColors;

var matrixCTM = mat4();
var matrixCTMLocation;
var matrixModelView = mat4();
var matrixProjection = mat4();

var bufferVertexId;
var bufferColorId;
var vPosition;
var vColor;

const ANGLE_INCREMENT = 1.0;

window.onload = init;
window.onkeydown = onKeyDown;

// Object class to load and display a 3D model
class Object {
    // Transformation parameters
    scaleFactor;
    rotateX;
    rotateY;
    // Rendering parameters
    setPainter;
    setCulling;
    lightVector; // Normalized light vector to calculate shades
    // Arrays to store vertices and faces
    vertices;
    #vertices;
    faces;
    // File reader to read OBJ files
    filereader;
    // Callback function to be called after loading ended
    onloadend;

    #onFileLoadEnd(e) {
        console.log("onLoadEnd... Begin");
        // Read object specifications from the file
        var lines = e.target.result.split('\n');
        // Clear all the previous vertex and face data
        this.vertices = [];
        this.faces = [];
        // Fetch the vertex and face data from the file
        for (var i = 0; i < lines.length; i++) {
            // var parts = lines[i].split(' ');
            var parts = lines[i].trim().split(/\s+/); // Split by multiple spaces
            switch(parts[0]) {
                case 'v': // Add a new vertex
                    this.vertices.push([Number(parts[1]), Number(parts[2]), Number(parts[3])]);
                    break;
                case 'f': // Add a new face
                case 'fo': // Face outline (fo) is deptrecated
                    for (var j = 3; j < parts.length; j++) {
                        var face = [];
                        face.push(Number(parts[1]-1));
                        face.push(Number(parts[j-1])-1);
                        face.push(Number(parts[j-0])-1);
                        this.faces.push(face);
                    }
                    break;
            }
        }
        console.log("onLoadEnd... End");
        // Call the callback function
        if (typeof this.onloadend == "function") {
            this.onloadend();
        }
    }

    #compareFaces(a, b) {
        return this.#vertices[a[0]][2] - this.#vertices[b[0]][2];
    }

    constructor() {
        this.vertices = new Array();
        this.#vertices = new Array();
        this.faces = new Array();
        this.filereader = new FileReader();
        // Once the OBJ file is loaded read the model data
        this.filereader.onloadend = this.#onFileLoadEnd.bind(this);
        // A common mistake is to extract a method from an object, then expect it to use the original object as its this
        // e.g. by using the method in callback-based code. Without care, however, the original object is usually lost.
        // Creating a bound function from the function, using the original object, neatly solves this problem.
        this.scaleFactor = 1;
        this.rotateX = 0;
        this.rotateY = 0;
        this.setPainter = true;
        this.setCulling = false;
        this.lightVector = [-1, 0, 0];
    }

    LoadFromFile(file) {
        this.filereader.readAsText(file);
    }
}

// Main program section

 // Define homogeneous coordinate for each vertex
    var vertices = [
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0)
    ]

    var colors = [
        vec4( 1.0, 0.0, 0.0, 1.0),
        vec4( 0.0, 1.0, 0.0, 1.0),
        vec4( 0.0, 0.0, 1.0, 1.0)
    ]

function init() {
    console.log("init... Begin");
    // Get reference to the file input
    fileopen = document.getElementById("file-open");
    //Set a listener for the selected file change event
    fileopen.onchange = onChange;
    // Get reference to the button
    // button = document.getElementById("proc-button");
    // button.onclick = processImage;
    // Get reference to the Painter and Culling checkboxes
    let button = document.getElementById("painter-toggle");
    button.onchange = onCheckChange;
    button = document.getElementById("culling-toggle");
    button.onchange = onCheckChange;
    // Creat an object to load 3D models
    model = new Object();
    model.onloadend = onLoadEnd;

    // Get reference to the WebGL context of the canvas
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //  Configure WebGL

    // Set the color value used when clearing color buffers.
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);   

    // Define homogeneous coordinate for each vertex
    triangleVertices = [
        vertices[0], vertices[2], vertices[1],
        vertices[0], vertices[3], vertices[2],
        vertices[1], vertices[2], vertices[3],
        vertices[0], vertices[1], vertices[3]
    ]
    
    triangleColors = [
        colors[0], colors[1], colors[2],
        colors[0], colors[1], colors[2],
        colors[0], colors[1], colors[2],
        colors[0], colors[1], colors[2]
    ]

    // Load the vertex data into the GPU

    // Create and initialize a WebGL buffer for storing data
    bufferVertexId = gl.createBuffer();

    // Bind the given WebGL buffer to the ARRAY_BUFFER target as a buffer containing vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertexId);

    // Initialize and create the buffer object's data store
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleVertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer

    // Get the location of an attribute variable in the WebGL program
    vPosition = gl.getAttribLocation(program, "vPosition");

    // Bind the buffer to a generic vertex attribute of the current vertex buffer object (VBO)
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    // Turn on the generic vertex attribute array at the specified index into the list of attribute arrays
    gl.enableVertexAttribArray(vPosition);

    // Get the location of the uniform variable which is part of the WebGL program
    matrixCTMLocation = gl.getUniformLocation(program, "ctm");

    // Load the vertex color data into the GPU
    bufferColorId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferColorId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleColors), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    transform();
    render();
    // window.setInterval(render, delay);

    console.log("init... End");
}

function transform() {

// REFERENCES THAT WERE USED FOR FIXATION OF "Change the program so it fixes the issue with perspective projection" TASK: 

// https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/building-basic-perspective-projection-matrix.html

// https://learnopengl.com/Getting-started/Camera 

    // Using 60° FOV (field of view) for perspective projection:
    // A 90° FOV is a very wide-angle lens, which causes strong distortion: objects near the edges appear stretched, and the whole scene looks exaggerated.
    // A 60° FOV is closer to a natural human-eye perspective and is the standard recommended value for 3D graphics in WebGL/OpenGL.

    // Using 2 as aspect ratio is not ideal because it might stretch the scene if canvas size changes.
    // Better: aspect = width / height;
    // This ensures the 3D object is not squeezed or stretched.

    // Update the projection matrix.
    matrixProjection = mult(perspective(60, canvas.width / canvas.height, 0.1, 10), translate(0.0, 0.0, -0.3));
    // Update the projection matrix.

    // Update the modelview matrix.

    // Start with an identity matrix.
    matrixModelView = mat4();

    // Moving the model 7 units back so it's actually visible inside the camera view.
    // Because before both the object and camera start at z = 0. That is why the view is odd.

    // matrixModelView = mult(translate(0, 0, -7), matrixModelView);


    //Apply uniform scaling.
    matrixModelView = mult(scalem(model.scaleFactor, model.scaleFactor, model.scaleFactor), matrixModelView);
    matrixModelView = mult(rotateX(model.rotateX), matrixModelView);
    matrixModelView = mult(rotateY(model.rotateY), matrixModelView);
}

function render() {

    // Set the color value used when clearing color buffers.
    // gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );


    // Clear color buffer to preset values.
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // Update the current transformation matrix 
    matrixCTM = mult(matrixProjection, matrixModelView);

    // Set hidden surface removal parameter.
    if (model.setPainter) {
        gl.enable(gl.DEPTH_TEST) 
    } else {
        gl.disable(gl.DEPTH_TEST)
    }


    // Set backface culling parameter.
    if (model.setCulling) {
        gl.enable(gl.CULL_FACE) 
    } else {
        gl.disable(gl.CULL_FACE)
    }

    // Specify the value of the uniform variable
    gl.uniformMatrix4fv(matrixCTMLocation, false, flatten(matrixCTM));

    // Render primitives from the array data
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertices.length);
}

function onChange(e) {
    console.log("onChange... Begin");
    // Get the name of the selected file
    const files = fileopen.files;
    // Get the file name extension (pop removes the last element in the array)
    let fileext = files[0].name.split('.').pop().toLowerCase();
    if (fileext == "obj") {
        model.LoadFromFile(files[0]);
    }
    console.log("onChange... End");
}

function onCheckChange(e) {
    console.log("onCheckChange... Begin");
    // Remember the status of the checkbox
    switch (e.target.id) {
        case 'painter-toggle':
            model.setPainter = e.target.checked;
            break;
        case 'culling-toggle':
            model.setCulling = e.target.checked;
            break;

    }
    render();
   
    console.log("onCheckChange... End");
}

function onLoadEnd() {
    // Update the triangle data from the model
    triangleVertices = [];
    triangleColors = [];
    for (var i = 0; i < model.faces.length; i++) {
        let face = model.faces[i];
        for (var j = 0; j < 3; j++) {
            let v = model.vertices[face[j]];
            triangleVertices.push(vec4(v[0], v[1], v[2], 1.0));
        }

        triangleColors.push(colors[0], colors[1], colors[2]);
    }

     // Bind the given WebGL buffer to the ARRAY_BUFFER target as a buffer containing vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertexId);
    // Initialize and create the buffer object's data store
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleVertices), gl.STATIC_DRAW);

    // Load the vertex color data into the GPU.
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferColorId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleColors), gl.STATIC_DRAW);

    // Render the canvas.
    render();

}

function onKeyDown(e) {
    console.log("onKeyDown..."+ e.key);
    switch(e.key) {
        case '=':
            model.scaleFactor *= 1.1;
            break;
        case '-':
            model.scaleFactor /= 1.1;
            break;
        case 'ArrowRight':
            model.rotateY += ANGLE_INCREMENT;
            break;
        case 'ArrowLeft':
            model.rotateY -= ANGLE_INCREMENT;
            break;
        case 'ArrowUp':
            model.rotateX += ANGLE_INCREMENT;
            break;
        case 'ArrowDown':
            model.rotateX -= ANGLE_INCREMENT;
            break;
    }

    transform();
    render();
}