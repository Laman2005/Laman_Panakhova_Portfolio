/*
    Copyright (c) <2012-2015> Ed Angel and Dave Shreiner
    Code sample for CSCI 2408 Computer Graphics 
    (c)2022-24 by Araz Yusubov 
    DISCLAIMER: All code examples we will look at are quick hacks intended to present working prototypes.
    Hence they do not follow best practice of programming or software engineering.    
*/


// THE REFERENCE FOR FIXATION USED IS THIS:
// Using textures in WebGL --- M mdn
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL

// This helped me to see:

// WebGL needs textures to be uploaded correctly, using gl.texImage2D with the actual Image object (not the event target).
// Non-power-of-two images need special texture settings, otherwise the texture appears black.
// We must use:
// CLAMP_TO_EDGE for wrapping
// LINEAR for filtering
// Mipmap generation only works when images are power-of-two, so we either disable it or adjust the parameters.
// Texture loading happens asynchronously, so rendering must happen after the image is fully loaded.


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
var triangleTexCoords;

// Variables realted to texture mapping
var uImage0;
var texture;
var texArray;
var imageTex;


var matrixCTM = mat4();
var matrixCTMLocation;
var matrixModelview = mat4();
var matrixProjection = mat4();

var bufferVertexId;
var bufferColorId;
var bufferTexCoordId;
var aPosition;
var aColor;
var aTexCoord;

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
    vec4( 0.5,-0.5, 0.5, 1.0),
    vec4(-0.5,-0.5,-0.5, 1.0),
    vec4( 0.5, 0.5,-0.5, 1.0)
]

var colors = [
    vec4( 1.0, 0.0, 0.0, 1.0),
    vec4( 0.0, 1.0, 0.0, 1.0),
    vec4( 0.0, 0.0, 1.0, 1.0)
]

var texcoords = [
    vec2(0.0, 0.0),
    vec2(1.0, 2.0),
    vec2(2.0, 0.0)
]

function init() {
    console.log("init... Begin");
    // Get reference to the file input
    fileopen = document.getElementById("file-open");
    //Set a listener for the selected file change event
    fileopen.onchange = onChange;
    // Add a listener to the texture file input.
    document.getElementById("file-open-tex").onchange = onTexFileChange;
    imageTex = new Image();
    imageTex.onload = onTexImageLoad;

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

    triangleTexCoords = [
        texcoords[0], texcoords[1], texcoords[2],
        texcoords[0], texcoords[1], texcoords[2],
        texcoords[0], texcoords[1], texcoords[2],
        texcoords[0], texcoords[1], texcoords[2]

    ]

    // Fill the default array for texture
    texArray = new Uint8Array(4*64*64);

    for (var i = 0; i < 64; i++) 
        for (var j = 0; j < 64; j++) {
            for ( var k = 0; k < 3; k++) {
                if ((Math.floor(i/8) + Math.floor(j/8)) % 2 == 0) 
                    texArray[4*64*i+4*j+k] = 255
                else texArray[4*64*i+4*j+k] = 0;
                
            }
            texArray[4*64*i+4*j+3] = 255;
    }

    

    // Load the vertex data into the GPU

    // Create and initialize a WebGL buffer for storing data
    bufferVertexId = gl.createBuffer();

    // Bind the given WebGL buffer to the ARRAY_BUFFER target as a buffer containing vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertexId);

    // Initialize and create the buffer object's data store
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleVertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer

    // Get the location of an attribute variable in the WebGL program
    aPosition = gl.getAttribLocation(program, "aPosition");

    // Bind the buffer to a generic vertex attribute of the current vertex buffer object (VBO)
    gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);

    // Turn on the generic vertex attribute array at the specified index into the list of attribute arrays
    gl.enableVertexAttribArray(aPosition);

    // Get the location of the uniform variable which is part of the WebGL program
    matrixCTMLocation = gl.getUniformLocation(program, "uCTM");

    // Load the vertex color data into the GPU
    bufferColorId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferColorId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleColors), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    aColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);

    // Load the vertex texture coordinate data into the GPU
    bufferTexCoordId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTexCoordId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleTexCoords), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    aTexCoord = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoord);

    // Tell the shader to get the texture from texture unit 0.
    uImage0 = gl.getUniformLocation(program, "uImage0");
    texture = gl.createTexture();

    // Tell WebGL we want to affect texture unit 0.
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to the texture unit 0.
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 64, 0, gl.RGBA, gl.UNSIGNED_BYTE, texArray);

    // Set texture parameters 
    gl.generateMipmap(gl.TEXTURE_2D);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    transform();
    render();
    // window.setInterval(render, delay);

    console.log("init... End");
}

function transform() {
    // Update the projection matrix.
    matrixProjection = mult(perspective(90, 2, 0.1, 10), translate(0.0, 0.0, -3));

    // Update the modelview matrix.

    // Start with an identity matrix.
    matrixModelview = mat4();
    // Apply uniform scaling.
    matrixModelview = mult(scalem(model.scaleFactor, model.scaleFactor, model.scaleFactor), matrixModelview);
    matrixModelview = mult(rotateX(model.rotateX), matrixModelview);
    matrixModelview = mult(rotateY(model.rotateY), matrixModelview);
}

function render() {
    // Set the color value used when clearing color buffers.
    // gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0);

    // Clear color buffer to preset values.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.TEXTURE_2D);

    // Update the current transformation matrix
    matrixCTM = mult(matrixProjection, matrixModelview);

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

    // Specify the value(s) of the uniform variable(s)
    gl.uniformMatrix4fv(matrixCTMLocation, false, flatten(matrixCTM));
    gl.uniform1i(uImage0, 0);

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

function onTexFileChange(e) {
    console.log("onTexFileChange... Begin");
    // Get the name of the selected file
    const files = e.target.files;
    if (files[0]) {
        imageTex.src = URL.createObjectURL(files[0]);
    }
    console.log("onTexFileChange... End");
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
    triangleTexCoords = [];
    for (var i = 0; i < model.faces.length; i++) {
        let face = model.faces[i];
        for (var j = 0; j < 3; j++) {
            let v = model.vertices[face[j]];
            triangleVertices.push(vec4(v[0], v[1], v[2], 1.0));
        }
        triangleColors.push(colors[0], colors[1], colors[2]);
        // Add also texture coordinates.
        triangleTexCoords.push(texcoords[0], texcoords[1], texcoords[2]);
    }

    // Bind the given WebGL buffer to the ARRAY_BUFFER target as a buffer containing vertex attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferVertexId);
    // Initialize and create the buffer object's data store
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleVertices), gl.STATIC_DRAW);

    // Load the vertex color data into the GPU.
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferColorId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleColors), gl.STATIC_DRAW);


    // Load the vertex texture coordinates data into the GPU.
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTexCoordId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleTexCoords), gl.STATIC_DRAW);


    // Render the canvas.
    render();
}

// FIX THE ISSUE

// This function was before fix 
// I don't want to delete this directly so I will include my fixed new function below keeping the same name for code consistency.
function onTexImageLoadOriginal(e) { 
    // Bind the texture to the texture unit 0.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, e.target);

    // Render the canvas.
    render();
}

// THE REFERENCE FOR FIXATION USED IS THIS:
// Using textures in WebGL --- M mdn
// https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL

// This helped me to see:

// WebGL needs textures to be uploaded correctly, using gl.texImage2D with the actual Image object (not the event target).
// Non-power-of-two images need special texture settings, otherwise the texture appears black.
// We must use:
// CLAMP_TO_EDGE for wrapping
// LINEAR for filtering
// Mipmap generation only works when images are power-of-two, so we either disable it or adjust the parameters.
// Texture loading happens asynchronously, so rendering must happen after the image is fully loaded.

function onTexImageLoad(e) {
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,imageTex); // FIX: use imageTex instead of e.target 

    // WebGL requires power-of-two textures for mipmaps & repeat mode,  (citation: Using textures in WebGL --- M mdn)
    // so set safe parameters to avoid black textures.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.generateMipmap(gl.TEXTURE_2D);

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