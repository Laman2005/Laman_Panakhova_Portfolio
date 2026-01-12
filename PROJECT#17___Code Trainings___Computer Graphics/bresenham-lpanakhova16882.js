/*
    Code sample for CSCI 2408 Computer Graphics 
    (c)2022-24 by Araz Yusubov 
    DISCLAIMER: All code examples we will look at are quick hacks intended to present working prototypes.
    Hence they do not follow best practice of programming or software engineering.    
*/


// PLEASE NOTE THAT I KEPT ALL FUNCTIONS 
// JUST EXTENDED THE EXISTING CODE BY ADDING NEW FUNCTIONS FOR SPECIFIC PURPOSES 



// USED RECOURCES for BRESENHAM'S ALGORITHM FOR ALL OCTANTS:
// THE CREDIT GOES TO YOUTUBE VIDEO SOURCE:
//      Bresenham's Line Algorithm - Demystified Step by Step 
//      https://www.youtube.com/watch?v=CceepU1vIKo&t=427s

// USED RECOURCES for ANTI-ALIASING:
// THE CREDIT GOES TO YOUTUBE VIDEO SOURCE:
//      Xiaolin Wu's Line Algorithm - Rasterizing Lines with Anti-Aliasing
//      https://www.youtube.com/watch?v=f3Rs20k-hcI
// THE CREDIT GOES TO GEEKSFORGEEKS VLOG SOURCE:
//      Anti-aliased Line | Xiaolin Wu's algorithm
//      https://www.geeksforgeeks.org/dsa/anti-aliased-line-xiaolin-wus-algorithm/


var canvas;
var context;
window.onload = init;

var GRID_SIZE = 30;
var GRID_COLOR = 'grey';
var LINE_COLOR = 'red';

// Coordinates of the line to draw
var lineX0, lineY0;
var lineX1, lineY1;

// Remember if you are to draw a line or mark the start point 
var startNewLine = false;


function init() {
    // Get reference to the 2D context of the canvas
    canvas = document.getElementById("gl-canvas");
    context = canvas.getContext("2d");

    if(context) {
        drawGrid();
        // Set a listener for the mousdown event
        canvas.onclick = onClick;
    }
}

function onClick(e) {
    startNewLine = !startNewLine;
    // Get coordinates of the mouse click within the canvas
    rect = canvas.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    //console.log(x,':', y);
    // Calculate the coordinates within the grid
    x = Math.floor(x/GRID_SIZE);
    y = Math.floor(y/GRID_SIZE);

    if(startNewLine) {
        // Draw the first pixel
        lineX0 = x;
        lineY0 = y;
        drawPixel(lineX0, lineY0);
    } else {
        // Draw the line to the second pixel
        lineX1 = x;
        lineY1 = y;
        //drawBresenhamForAllOctants(lineX0, lineY0, lineX1, lineY1);
        drawLineAliasing(lineX0, lineY0, lineX1, lineY1);

    }
}

// Draw a pixel with brightness for anti-aliasing
function drawPixelAliasing(x, y, brightness = 1) {
    context.fillStyle = LINE_COLOR;      
    // Use brightness as transparency
    context.globalAlpha = brightness;    
    
    x = x * GRID_SIZE;
    y = y * GRID_SIZE;
    context.fillRect(x, y, GRID_SIZE, GRID_SIZE);

    // Reset alpha
    context.globalAlpha = 1.0; 
}


function drawPixel(x, y) {
    context.fillStyle = LINE_COLOR;
    x = x * GRID_SIZE;
    y = y * GRID_SIZE;
    context.fillRect(x, y, GRID_SIZE, GRID_SIZE);
}

// BRESENHAM'S ALGORITHM FOR ONE OCTANT as per video instruction
function drawBresenham() {
    x = lineX0;
    y = lineY0;
    dx = lineX1 - lineX0; 
    dy = lineY1 - lineY0; 

    d = dx;
    while(x <= lineX1) {
        drawPixel(x, y);
        x = x + 1;
        d = d - 2*dy;
        // Check if wee need to move to the next line
        if(d < 0) {
            y = y + 1;
            d = d + 2*dx;
        }
    }
}


// BRESENHAM'S FOR ALL OCTANTS

// References:
// USED RECOURCES for BRESENHAM'S ALGORITHM FOR ALL OCTANTS: (OPTIONAL)
// THE CREDIT GOES TO YOUTUBE VIDEO SOURCE:
//      Bresenham's Line Algorithm - Demystified Step by Step 
//      https://www.youtube.com/watch?v=CceepU1vIKo&t=427s


// Lines with slope <= 1
function drawBresenhamHorizontal(x0, y0, x1, y1) {
    // Draw from left to right
    if (x0 > x1) {
        // Swap the points if x0 > x1
        tempX = x0;
        tempY = y0;
        x0 = x1;
        y0 = y1;
        x1 = tempX;
        y1 = tempY;
    }

    dx = x1 - x0;
    dy = y1 - y0;

    // Determine the direction of y-axis movement
    dir = dy < 0 ? -1 : 1;
    dy *= dir;

    if (dx > 0) {
        y = y0;
        // Initial decision parameter
        p = 2 * dy - dx;
        
        for (i = 0; i <= dx; i++) {
            // drawPixel function 
            drawPixel(x0 + i, y); 
            if (p >= 0) {
                // If error exceeds the treshold step up
                y += dir;
                p -= 2 * dx;
            }
            // Update the decision parameter
            p += 2 * dy;
        }
    }
}


// Lines with slope > 1
function drawBresenhamVertical(x0, y0, x1, y1) {
    // Draw from bottom to top
    if (y0 > y1) {
        // Swap the points if y0 > y1
        tempX = x0;
        tempY = y0;
        x0 = x1;
        y0 = y1;
        x1 = tempX;
        y1 = tempY;
    }

    dx = x1 - x0;
    dy = y1 - y0;

    // Determine the direction of x-axis movement
    dir = dx < 0 ? -1 : 1;
    dx *= dir;

    if (dy > 0) {
        x = x0;
        // Initial decision parameter
        p = 2 * dx - dy;

        for (i = 0; i <= dy; i++) {
            // drawPixel function 
            drawPixel(x, y0 + i); 
            if (p >= 0) {
                // If error exceeds the treshold step right
                x += dir;
                p -= 2 * dy;
            }
            // Update the decision parameter
            p += 2 * dx;
        }
    }
}

function drawBresenhamForAllOctants(x0, y0, x1, y1) {
    if (Math.abs(x1 - x0) > Math.abs(y1 - y0)) {
         // Draw horizontal line
        drawBresenhamHorizontal(x0, y0, x1, y1);
    } else {
         // Draw vertical line
        drawBresenhamVertical(x0, y0, x1, y1);
    }
}

// ANTI-ALIASING

// References:
// USED RECOURCES for ANTI-ALIASING:
// THE CREDIT GOES TO YOUTUBE VIDEO SOURCE:
//      Xiaolin Wu's Line Algorithm - Rasterizing Lines with Anti-Aliasing
//      https://www.youtube.com/watch?v=f3Rs20k-hcI
// THE CREDIT GOES TO GEEKSFORGEEKS VLOG SOURCE:
//      Anti-aliased Line | Xiaolin Wu's algorithm
//      https://www.geeksforgeeks.org/dsa/anti-aliased-line-xiaolin-wus-algorithm/

// Draw an anti-aliased btw two points 
function drawLineAliasing(x0, y0, x1, y1) {
    // Check the slope < or > 1
    if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
        // Draw from left to right
        if (x1 < x0) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        // horizontal distance
        dx = x1 - x0;
        // vertical distance
        dy = y1 - y0;
        // slope
        m = dy / dx;

        // Starting pixel
        // How much of the starting pixel is covered by the line
        overlap = 1 - ((x0 + 0.5) - Math.floor(x0 + 0.5));
        distStart = y0 - Math.floor(y0);
        drawPixelAliasing(Math.floor(x0 + 0.5), Math.floor(y0), (1 - distStart) * overlap);
        drawPixelAliasing(Math.floor(x0 + 0.5), Math.floor(y0) + 1, distStart * overlap);

        // Ending pixel
        overlap = (x1 - 0.5) - Math.floor(x1 - 0.5);
        distEnd = y1 - Math.floor(y1);
        drawPixelAliasing(Math.floor(x1 - 0.5), Math.floor(y1), (1 - distEnd) * overlap);
        drawPixelAliasing(Math.floor(x1 - 0.5), Math.floor(y1) + 1, distEnd * overlap);

        // Middle pixels
        for (i = 1; i < Math.round(dx + 0.5); i++) {
            y = y0 + i * m;
            ix = Math.floor(x0 + i);
            iy = Math.floor(y);
            dist = y - iy;
            drawPixelAliasing(ix, iy, 1 - dist);
            drawPixelAliasing(ix, iy + 1, dist);
        }

    } else {
        // Draw a line from bottom to top 
        if (y1 < y0) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        // Horizontal distance 
        dx = x1 - x0;
        // Vertical distance 
        dy = y1 - y0;
        // Inverse Slope
        m = dx / dy;

         // Starting pixel
        // How much of the starting pixel is covered by the line
        overlap = 1 - ((y0 + 0.5) - Math.floor(y0 + 0.5));
        distStart = x0 - Math.floor(x0);
        drawPixelAliasing(Math.floor(x0), Math.floor(y0 + 0.5), (1 - distStart) * overlap);
        drawPixelAliasing(Math.floor(x0) + 1, Math.floor(y0 + 0.5), distStart * overlap);

        // Ending pixel
        overlap = (y1 - 0.5) - Math.floor(y1 - 0.5);
        distEnd = x1 - Math.floor(x1);
        drawPixelAliasing(Math.floor(x1), Math.floor(y1 - 0.5), (1 - distEnd) * overlap);
        drawPixelAliasing(Math.floor(x1) + 1, Math.floor(y1 - 0.5), distEnd * overlap);

        // Middle pixels
        for (i = 1; i < Math.round(dy + 0.5); i++) {
            x = x0 + i * m;
            ix = Math.floor(x);
            iy = Math.floor(y0 + i);
            dist = x - ix;
            drawPixelAliasing(ix, iy, 1 - dist);
            drawPixelAliasing(ix + 1, iy, dist);
        }
    }
}


function drawLine(x0, y0, x1, y1){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();

}

function drawGrid(){
    // Set the line styles
    context.strokeStyle = GRID_COLOR;
    context.lineWidth = 1;

    // Draw the vertical lines 
    x = 0;
    while (x <= canvas.clientWidth){
        drawLine(x, 0, x, canvas.clientHeight);
        x = x + GRID_SIZE;
        
    }

    // Draw the horizontal lines
    y = 0;
    while (y <= canvas.clientHeight){
        drawLine(0, y, canvas.clientWidth, y);
        y = y + GRID_SIZE;
        
    }

}
