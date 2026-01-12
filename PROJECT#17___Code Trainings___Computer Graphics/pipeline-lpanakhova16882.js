/*
    Code sample for CSCI 2408 Computer Graphics 
    (c)2022-24 by Araz Yusubov 
    DISCLAIMER: All code examples we will look at are quick hacks intended to present working prototypes.
    Hence they do not follow best practice of programming or software engineering.    
*/
var canvas;
var context;
var fileopen;
// An Object instance to load and display a 3D model
var model;

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
                case 'fo': // Face outline (fo) is deprecated
                   
                    for (var j = 3; j < parts.length; j++) {
                        var face = [];
                        face.push(Number(parts[1])-1);
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
        this.setPainter = false;
        this.lightVector = [-1, 0, 0];
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
        for (var i = 0; i < this.vertices.length; i++) {
            // Read the next vertex
            var x = this.vertices[i][0];
            var y = this.vertices[i][1];
            var z = this.vertices[i][2];
            // Temporarily hold old coordinates
            var xt = x; var yt = y; var zt = z;
            // Transform the vertex and save it
            // Rotate it around y-axis
            x = xt * Math.cos(this.rotateY) - zt * Math.sin(this.rotateY);
            z = xt * Math.sin(this.rotateY) + zt * Math.cos(this.rotateY);
            xt = x; yt = y; zt = z;
            // Rotate it around x-axis
            y = yt * Math.cos(this.rotateX) - zt * Math.sin(this.rotateX);
            z = yt * Math.sin(this.rotateX) + zt * Math.cos(this.rotateX);
            // Scale it uniformly
            x = x * this.scaleFactor;
            y = y * this.scaleFactor;
            z = z * this.scaleFactor;
            // Move it to the center of the canvas
            x = x + xcenter;
            y = -y + ycenter;
            this.#vertices.push([x, y, z]);
            // Draw a pixel for the vertex
            // context.fillRect(x, y, 1, 1);
        }
        // Sort the faces by ascending order of z value of the first vertex
        if (this.setPainter) this.faces.sort(this.#compareFaces.bind(this));
        // Draw the faces on the canvas
        var normal = [];
        for (var i = 0; i < this.faces.length; i++) {
            var face = this.faces[i];
            // Draw a polygon for a face
            context.beginPath();
            var v0 = this.#vertices[face[0]];
            var v1 = this.#vertices[face[1]];
            var v2 = this.#vertices[face[2]];
            // We know that all faces are triangles
            context.moveTo(v0[0], v0[1]);
            context.lineTo(v1[0], v1[1]);
            context.lineTo(v2[0], v2[1]);
            // for (var j = 1; j < face.length; j++) {
            //     v = this.#vertices[face[j]];
            //     context.lineTo(v[0], v[1]);
            // }
            // Calculate the normal vector of the triangle 
            normal = [];
            // ... as a cross product of its sides
            var b = [v1[0] - v0[0], v1[1] - v0[1], v1[2]- v0[2]];
            var a = [v2[0] - v0[0], v2[1] - v0[1], v2[2]- v0[2]];
            normal.push(a[1]*b[2] - a[2]*b[1]); // x coordinate
            normal.push(a[2]*b[0] - a[0]*b[2]); // y coordinate
            normal.push(a[0]*b[1] - a[1]*b[0]); // z coordinate
            // Calculate the length of the normal vector 
            var nlen = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2]);
            // Calculate cosine of the angle between the normal and light vectors
            var cos = this.lightVector[0]*normal[0] + this.lightVector[1]*normal[1] + this.lightVector[2]*normal[2];
            cos = cos / nlen;
            if (cos < 0) cos = 0;
            // Set the fill style as a shade of red
            context.fillStyle = `rgb(${255 * cos}, 0, 0)`;
            context.fill();
            // context.stroke();
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
    // Get reference to the Painter checkbox
    button = document.getElementById("painter-toggle");
    button.onchange = onCheckChange;
    // Get reference to the 2D context of the canvas
    canvas = document.getElementById("gl-canvas");
    context = canvas.getContext("2d");
    // Creat an object to load 3D models
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

function onCheckChange(e) {
    console.log("onCheckChange... Begin");
    // Get the name of the selected file
    // Remember the status of the checkbox
    model.setPainter = e.target.checked;
    model.DrawOnCanvas(context);
    console.log("onCheckChange... End");
}

function onLoadEnd() {
    model.DrawOnCanvas(context);
}

function onKeyDown(e) {
    console.log("onKeyDown..."+ e.key);
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