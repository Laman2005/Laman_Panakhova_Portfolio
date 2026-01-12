/*
    Code sample for CSCI 2408 Computer Graphics 
    (c)2022-24 by Araz Yusubov 
    DISCLAIMER: All code examples we will look at are quick hacks intended to present working prototypes.
    Hence they do not follow best practice of programming or software engineering.    
*/

// USED RECOURCES for ROTATION AROUND X & Z:

            // THE CREDIT GOES TO GEEKSFORGEEKS VLOG SOURCE:
            // Computer Graphics - 3D Rotation Transformations
            // https://www.geeksforgeeks.org/computer-graphics/computer-graphics-3d-rotation-transformations/
            
// USED RECOURCES for FILLING POLYGONS:

            // THE CREDIT GOES TO MDN - Mozilla SOURCE:
            // CanvasRenderingContext2D: fill() method
            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fill            

// Discussion below

var canvas;
var context;
var fileopen;
// An Object instance to load display a 3D model
var model;

window.onload = init;
window.onkeydown = onKeyDown;

// Object class to load and display a 3D model
class Object{
    // Transformation parameters
    scaleFactor;
    rotateY;
    rotateX;
    rotateZ;
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
        // Read object specification from the file
        var lines = e.target.result.split('\n');
        // Clear all the previous vertex and face data
        this.vertices = [];
        this.faces = [];
        // Fetch the vertex and face data from the file
        for (var i = 0; i < lines.length; i++) {
            var parts = lines[i].split(' ');
            switch(parts[0]) {
                case 'v': // Add a new vertex
                this.vertices.push([Number(parts[1]), Number(parts[2]), Number(parts[3])]);
                break;

                case 'f': // Add a new face
                var face = [];
                for(var j = 1; j < parts.length; j++) {
                    face.push(Number(parts[j]) - 1);
                }
                this.faces.push(face);
                break;
            }
        }
        console.log("onLoadEnd... End");
        // Call the callback function 
        if (typeof this.onloadend == "function") {
            this.onloadend();
        }

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
        this.rotateY = 0;
        this.rotateX = 0;
        this.rotateZ = 0;

        this.fillFaces = false;

    }

    LoadFromFile(file) {
        this.filereader.readAsText(file);
    }

    DrawOnCanvas(context) {
        // Clear the canvas related to the provided context
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        this.#vertices = [];
        // Get the coordinates for the center of the canvas
        var xcenter = context.canvas.width / 2;
        var ycenter = context.canvas.height / 2;
        for(var i = 0; i < this.vertices.length; i++) {
            // Read the next vertex
            var x = this.vertices [i][0];
            var y = this.vertices [i][1];
            var z = this.vertices [i][2];
            // Transform the vertex and save it
            // Scale it uniformly
            x = x * this.scaleFactor;
            y = y * this.scaleFactor;
            z = z * this.scaleFactor;
            // Rotate it around y-axis
            x = x * Math.cos(this.rotateY) - z * Math.sin(this.rotateY);
            z = x * Math.sin(this.rotateY) - z * Math.cos(this.rotateY);

            // USED RECOURCES for ROTATION AROUND X & Z:

            // THE CREDIT GOES TO GEEKSFORGEEKS VLOG SOURCE:
            // Computer Graphics - 3D Rotation Transformations
            // https://www.geeksforgeeks.org/computer-graphics/computer-graphics-3d-rotation-transformations/
            
            // Rotate around X
            let y1 = y * Math.cos(this.rotateX) - z * Math.sin(this.rotateX);
            let z1 = y * Math.sin(this.rotateX) + z * Math.cos(this.rotateX);
            y = y1; z = z1;

            // Rotate around Z
            let x3 = x * Math.cos(this.rotateZ) - y * Math.sin(this.rotateZ);
            let y3 = x * Math.sin(this.rotateZ) + y * Math.cos(this.rotateZ);
            x = x3; y = y3;


            // Move it to the center of the canvas
            x = x + xcenter;
            y = y + ycenter;
            this.#vertices.push([x, y, z]);
            // Draw a pixel for the vertex
            context.fillRect(x, y, 1, 1);


        }
        // Draw the faces on the canvas
        for(var i = 0; i < this.faces.length; i++) {
            var face = this.faces[i];
            // Draw a polygon for a face
            context.beginPath();
            var v = this.#vertices[face[0]];
            context.moveTo(v[0], v[1]);
            for (var j = 1; j < face.length; j++) {
                v = this.#vertices[face[j]];
                context.lineTo(v[0], v[1]);

    // USED RECOURCES for FILLING POLYGONS:

            // THE CREDIT GOES TO MDN - Mozilla SOURCE:
            // CanvasRenderingContext2D: fill() method
            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fill    
            
            // DISCUSSION: In our program, faces can be shown as wireframes or filled shapes. 
            // Doing so makes the model look solid, but sometimes faces that should be behind show up in front. 
            // This happens because the canvas does not know which parts are closer. 
            // To fix this, computer graphics use methods like drawing far faces first (Painter’s Algorithm) 
            // or checking depth for every pixel (Z-buffering). 
            // This program is a simple step to see why these methods are needed.

            context.closePath();

            if (this.fillFaces) {
                context.fillStyle = "rgba(100,150,255,0.5)";
                context.fill();
            } else {
                context.stroke();
            }

            // }
            // context.stroke();

        }
    }

    }
}

// Main program section

function init() {
    console.log("init... Begin");
    // Get reference to the file input
    fileopen = document.getElementById("file-open");
    //Set a listener for the selected file change event
    fileopen.onchange = onChange;
    // Get reference to the button
    button = document.getElementById("proc-button");
    button.onclick = processImage;
    // Get reference to the 2D context of the canvas
    canvas = document.getElementById("gl-canvas");
    context = canvas.getContext("2d");
    // Create an object to load 3D models
    model = new Object();
    model.onloadend = onLoadEnd;
    console.log("init... End");
}

function onChange(e) {
    console.log("onChange... Begin");
    // Get the name of the selected file
    const files = fileopen.files;
    // Get the file name extension (pop removes the last element in the array)
    fileext = files[0].name.split('.').pop().toLowerCase();
    if (fileext == "obj") {
        model.LoadFromFile(files[0]);
    }
    console.log("onChange... End");
}

function onLoadEnd(){
    model.DrawOnCanvas(context);
}

function onKeyDown(e) {
    console.log("onKeyDown..." + e.key);
    switch(e.key) {
        case '=':
            model.scaleFactor *= 1.1;
            model.DrawOnCanvas(context);
            break;

        case '-':
            model.scaleFactor /= 1.1;
            model.DrawOnCanvas(context);
            break;

        case 'ArrowRight':
            model.rotateY += 0.1;
            model.DrawOnCanvas(context);
            break;

        case 'ArrowLeft':
            model.rotateY -= 0.1;
            model.DrawOnCanvas(context);
            break;

        case 'ArrowUp':
            model.rotateX += 0.1;
            model.DrawOnCanvas(context);
            break;   

        case 'ArrowDown':
            model.rotateX -= 0.1;
            model.DrawOnCanvas(context);
            break;

        case 'z':
            model.rotateZ += 0.1;
            model.DrawOnCanvas(context);
            break;

        case 'x':
            model.rotateZ -= 0.1;
            model.DrawOnCanvas(context);
            break;

        case 'f':   //fill polygons
            model.fillFaces = !model.fillFaces;
            break;
    }
}

function processImage() {
    console.log("Processing... Begin")
    // Get image data for all the canvas
    const imgdata = context.getImageData(0, 0, canvas.width, canvas.height);
    // Get the array containing the pixel data in the RGBA order
    const data = imgdata.data;
    for (var i = 0; i < data.length; i += 4) {
        // Manipulating colors (inverting)
        data[i] = 255 - data[i];
        data[i+1] = 255 - data[i+1];
        data[i+2] = 255 - data[i+2];
    }
    context.putImageData(imgdata, 0, 0);
    console.log("Processing... End")
}