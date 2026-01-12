/*
    Code sample for CSCI 2408 Computer Graphics 
    (c)2022-24 by Araz Yusubov 
    DISCLAIMER: All code examples we will look at are quick hacks intended to present working prototypes.
    Hence they do not follow best practice of programming or software engineering.    
*/

 // USED RECOURCES for SEPIA EFFECT (OPTIONAL):
// THE CREDIT GOES TO GEEKSFORGEEKS VLOG SOURCE:
// Image Processing in Java - Colored Image to Sepia Image Conversion
// https://www.geeksforgeeks.org/java/image-processing-in-java-colored-image-to-sepia-image-conversion/

var canvas;
var context;
var fileopen;
//Image to read supported image files 
var image = new Image();
// File reader to read TGA files
var filereader = new FileReader();

window.onload = init;

function init() {
    console.log("init... Begin");

    // Get reference to the 2D context of the canvas
    canvas = document.getElementById("gl-canvas");
    context = canvas.getContext("2d");

    // Get reference to the file input
    fileopen = document.getElementById("file-open");
    // Set a listener for the selected file change event
    fileopen.onchange = onChange;
    // Once the image is loaded draw it on the canvas
    image.onload = onImageLoad;
    // once the TGA file is loaded draw it on the canvas
    filereader.onloadend = onLoadEnd;
    // Get reference to the button
    button = document.getElementById("proc-button");
    button.onclick = processImage;

    console.log("init... End");
}

function onChange(e) {
    console.log("onChange... Begin");
    // Get the name of the selected file
    const files = fileopen.files;
    // Get the file name extension 
    fileext = files[0].name.split('.').pop().toLowerCase();
    if (fileext == "tga"){
        console.log("onChange... TGA file");

        filereader.readAsArrayBuffer(files[0]);
    } else {
        console.log("onChange... Non-TGA file");
        image.src = URL.createObjectURL(files[0]);
    }
    console.log("onChange... End");

}

function onImageLoad() {
    console.log("onImageLoad... Begin");
    // Resize the canvas to match the image size
    canvas.width = image.width;
    canvas.height = image.height;
    //Draw the image from the top left
    context.drawImage(image, 0, 0);

    console.log("onImageLoad... End");


}

function processImage() {
    console.log("processImage... Begin");

    // Get image data for all the canvas
    const imgdata = context.getImageData(0, 0, canvas.width, canvas.height);
    // Get the array containing the pixel data in the RGBA order
    const data = imgdata.data;

    // IF YOU WANT TO BRING THE ORIGINAL ONE BACK, UNCOMMENT THE FOR LOOP BELOW

    // for (var i = 0; i < data.length; i += 4) {
        // Manipulate colors (inverting)
    //     data[i] = 255 - data[i];
    //     data[i+1] = 255 - data[i+1];
    //     data[i+2] = 255 - data[i+2];


    // USED RECOURCES for SEPIA EFFECT:
// THE CREDIT GOES TO GEEKSFORGEEKS VLOG SOURCE:
// Image Processing in Java - Colored Image to Sepia Image Conversion
// https://www.geeksforgeeks.org/java/image-processing-in-java-colored-image-to-sepia-image-conversion/
    
// ADDING SEPIA EFFECT (OPTIONAL)
        for (let i = 0; i < data.length; i += 4) {
        let R = data[i];     // Red
        let G = data[i + 1]; // Green
        let B = data[i + 2]; // Blue
        let A = data[i + 3]; // Alpha (transparency, keep same)

        // SEPIA FORMULA 
        let newRed   = Math.min(255, parseInt(0.393 * R + 0.769 * G + 0.189 * B));
        let newGreen = Math.min(255, parseInt(0.349 * R + 0.686 * G + 0.168 * B));
        let newBlue  = Math.min(255, parseInt(0.272 * R + 0.534 * G + 0.131 * B));

        // Update pixel
        data[i]     = newRed;
        data[i + 1] = newGreen;
        data[i + 2] = newBlue;
        data[i + 3] = A;  // keep alpha unchanged
    }
    context.putImageData(imgdata, 0, 0);
    console.log("processImage... End");
}

function onLoadEnd() {
    console.log("onLoadEnd... Begin");
    // Read image specification from the file
    view = new DataView(filereader.result, 0, 2);
    let tgaIDLength = view.getUint8(0);
    let tgaColorMapType = view.getUint8(1);
    view = new DataView(filereader.result, 12, 6);
    let tgaWidth = view.getUint16(0, true);
    let tgaHeight = view.getUint16(2, true);
    let tgaPixelDepth = view.getUint8(4);
    let tgaDescriptor = view.getUint8(5);
    let tgaAlphaBits = tgaDescriptor % 16;
    // Use template literals delimited with backtick to show specification 
    console.log(`onLoadEnd... Size: ${tgaWidth}x${tgaHeight} Depth: ${tgaPixelDepth} Alpha: ${tgaAlphaBits} Color map: ${tgaColorMapType}`);
    // Resize the canvas to match the image size
    canvas.width = tgaWidth;
    canvas.height = tgaHeight;
    // Get image data for all the canvas
    const imgdata = context.getImageData(0, 0, canvas.width, canvas.height);
    // Get the array containing the pixel data in the RGBA order
    const data = imgdata.data;
    // Fetch the pixel data from the file
    view = new DataView(filereader.result, 18 + tgaIDLength + tgaColorMapType);
    for (var y = 0; y < tgaHeight; y++) {
        for (var x = 0; x < tgaWidth; x++) {
            var icanvas = (y * tgaWidth + x) * 4;
            var ifile =  (y * tgaWidth + x) *tgaPixelDepth / 8;
            
            switch(tgaPixelDepth) {
                case 16:
                    // TODO
                    let pixel16 = view.getUint16(ifile, true);
                    blue  = (pixel16 & 0x1F) << 3;
                    green = ((pixel16 >> 5) & 0x1F) << 3;
                    red   = ((pixel16 >> 10) & 0x1F) << 3;
                    alpha = (pixel16 & 0x8000) ? 255 : 255; 
                    break;
                case 24:
                    blue = view.getUint8(ifile + 0);
                    green = view.getUint8(ifile + 1);
                    red = view.getUint8(ifile + 2);
                    alpha = 255;
                    break;
                case 32:
                    // TODO
                    blue  = view.getUint8(ifile + 0);
                    green = view.getUint8(ifile + 1);
                    red   = view.getUint8(ifile + 2);
                    alpha = view.getUint8(ifile + 3);
                    break;
            }
            data[icanvas + 0] = red;
            data[icanvas + 1] = green;
            data[icanvas + 2] = blue;
            data[icanvas + 3] = alpha;
        }
    }
    context.putImageData(imgdata, 0, 0);
    console.log("onLoadEnd... End");
}