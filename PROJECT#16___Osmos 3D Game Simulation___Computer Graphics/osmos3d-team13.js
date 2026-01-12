/*
    CSCI 2408 Computer Graphics Fall 2025 
    (c)2025 by Name Surname 
    Submitted in partial fulfillment of the requirements of the course.
*/



/*  ---------------- TAKE INTO ACCOUNT --------------------------------------
    DOUBLE CLIKCING THE HTML FILE WILL NOT LOAD THE TEXTURES DUE TO BROWSER SECURITY RESTRICTIONS.
    PLEASE USE A LOCAL SERVER TO HOST THE FILES.
    OTHERWISE THE TEXTURES WILL NOT LOAD PROPERLY. AND THE PROGRAM WILL NOT RENDER AS EXPECTED.
    CORS POLICY RESTRICTIONS WILL BLOCK THE TEXTURE LOADING.
    ------------------------------------------------------------
*/


/*
    Team 13 - Laman Panakhova 16882 - 33% contribution:

    Laman Panakhova 16882 (33% contribution) – Rendering
      Implemented the rendering pipeline, including sphere geometry, buffers, 
      textures, camera setup, and draw calls; debugged visual artifacts and documented rendering flow.

    Nigar Nazarli 16262 (33% contribution) – Shading & Lighting
      Developed lighting and shading logic, tuned material properties, 
      handled normals and highlights, debugged visual artifacts and documented rendering flow, 
      and documented the Phong shading implementation.

    Islam Ibrahimov 18060 (33% contribution) – Motions
      Implemented motion and physics, including velocity, thrust, damping, collisions, 
      absorption logic, and randomized mote placement; documented the physics and interaction system.
*/

//  Main program: osmos3d-team 13.js

// SUMMARY:

// Motes (Spheres): The game renders a collection of motes, which are approximated as spheres.
// Player Control: The player starts at the bottom-center of the screen. They can thrust forward by pressing the W key.
// Camera Rotation: The camera can be rotated around the player by dragging the mouse.
// Collision System:
// Larger motes absorb smaller motes (partially).
// The player's mote grows or shrinks based on absorption.
// Skybox: The skybox is an inner sphere with a texture. When motes collide with the skybox, they bounce off.
// Lighting: Phong lighting is used in the scene. The light source can be set to orbit around the scene if chosen.
// Textures: The game supports textures, and users can place texture files in the assets/ folder for use.
"use strict";

 /*

 PROJECT DOCUMENTATION:
    This JavaScript/WebGL program implements a 3D "mote absorption"
simulation inspired by the gameplay of *Osmos*.

   All parts of this implementation are documented in accordance
with course requirements. Any algorithm, model, texture, design
pattern, code snippet, or conceptual inspiration not originally
authored by us is cited explicitly below.

REFERENCES AND SOURCES USED:
1) Angel & Shreiner, *Interactive Computer Graphics*,
      7th Edition — Used for:
        - The perspective() and lookAt() matrix patterns
        - Sphere subdivision method (octahedral subdivision)
        - Normal, lighting, and Phong shading logic foundations

2) MDN WebGL Documentation (Mozilla Developer Network):
      https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API
      Used for:
        - Buffer creation examples
        - Texture-loading patterns
        - Understanding WebGL state machine behavior

3) StackOverflow discussions on “UV mapping sphere seam fix”:
      https://stackoverflow.com/questions/20710547
      Used for:
        - Handling texture coordinate wrapping around sphere poles
        - Our getTexCoord() seam-correction logic

4) Skybox implementation concept from WebGL Fundamentals:
      https://webglfundamentals.org/webgl/lessons/webgl-skybox.html
      Used conceptually for:
        - Rendering a large sphere around the scene as skybox
        - Disabling backface culling for skybox pass

5) Texture image placeholders:
      “mote4.png” — student-created artwork  
      “skybox.png” — created by student or sourced from a CC0 skybox
      If externally sourced: https://opengameart.org (CC0 skybox packs)

6) Linear Algebra and Physics for Game Developers. (n.d.). Retrieved from https://learnopengl.com/ 
        or equivalent physics/math references.


REQUIRED AI USAGE:
    You can see below at the end of the file.

 */

// Global WebGL Setup + Game Constants:

// These variables store system-wide constants, buffer handles,
// shader program references, and rendering state. We declare them
// here for clarity and to maintain a single point of modification
// for top-level parameters like mote sizes, skybox size, camera
// configuration, lighting defaults, and movement physics.

var canvas;
var gl;
var program;

// Mote and Scene Constants:

// These constants define gameplay scale, physics behaviors,
// and visual constraints for how the motes behave in 3D space.
// MIN_MOTE_SIZE, MAX_MOTE_SIZE → ensures variation.
// COLLISION_THRESHOLD < 1 creates softer collision detection.
// PROPULSION_FORCE / DRAG_COEFFICIENT → controls movement realism.
// const NUM_MOTES = 100;

// --- Mote and Scene Constants ---
const NUM_MOTES = 100;
const MIN_MOTE_SIZE = 0.1;
const MAX_MOTE_SIZE = 2.0;
const INITIAL_PLAYER_RADIUS = 0.5;
const MAX_SKYBOX_RADIUS = 100.0;
const COLLISION_THRESHOLD = 0.9;
const DRAG_COEFFICIENT = 0.02; // B1: Slows down player mote (simulates drag)
const PROPULSION_FORCE = 0.008; // B1: Force applied by keyboard input
const MOTES_ROTATION_SPEED = 0.5; // degrees per frame

const LIGHT_SPEED = 500.0; // B4: Speed of light orbiting

// A2: Optimized Colors for Better Visual Appeal
const COLOR_LARGER = vec4(1.0, 0.4, 0.8, 1.0); // Bright Magenta/Violet
const COLOR_SMALLER = vec4(0.1, 0.9, 1.0, 1.0); // Electric Blue/Cyan


// Camera and View Control:

// The camera uses a classical "orbit around player" system:
// - mouse movement rotates around X/Y axes
// - W/S/A/D apply thrust relative to camera view direction
// The camera is not fully free-flying; it always tracks the player.

// --- Camera and View Control (Req Minimum) ---
var eye = vec3(0.0, 1.0, 5.0); 
var at = vec3(0.0, 0.0, 0.0); 
var up = vec3(0.0, 1.0, 0.0);
var fieldOfView = 60.0;
var aspect;
var near = 0.1;
var far = 100.0;

// Mouse control variables (Req Minimum: Scene rotation)
var mouseLastX = 0;
var mouseLastY = 0;
var mouseIsDown = false;
var cameraAngleX = 0;
var cameraAngleY = 0;

// Lighting and Materials:

// Standard Blinn-Phong lighting model parameters.
// Following the classical implementation taught in WebGL courses
// and described in *Interactive Computer Graphics*.

// --- Lighting and Materials (Req A1) ---
var lightPosition = vec3(10.0, 10.0, 10.0);
var ambientColor = vec4(0.3, 0.3, 0.3, 1.0); 
var diffuseColor = vec4(1.0, 1.0, 1.0, 1.0);
var specularColor = vec4(1.0, 1.0, 1.0, 1.0);
var shininess = 200.0; 


// OOP USAGE:

// Mote Class Definition
/*
   Purpose:
      Represents individual motes (spheres) in the simulation.
      Stores physical properties (mass, radius, velocity),
      world-space position, and flags for player/skybox.

   Notes:
      - The radius determines mass (volume-based approximation).
      - collidesWith() uses squared distances for efficiency.
      - targetRadius supports growth/shrink animation.

   External inspiration:
      Distance-based sphere collision detection from standard
      physics engine approximations (MDN + StackOverflow discussions).
*/

// --- Player and Mote Data Structure ---
class Mote {
    constructor(radius, position, isPlayer = false, texture) {
        this.radius = radius;
        this.position = position; 
        this.isPlayer = isPlayer;
        this.velocity = vec3(0.0, 0.0, 0.0); 
        this.texture = texture;
        this.mass = radius * radius * radius; 
        this.alive = true;

        // for animation
        this.targetRadius = radius;

        // Random rotation axis (normalized)
        // We store this random rotation axis to make all motes rotate randomly
        this.rotationAxis = normalize(vec3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        ));
        
        // Current rotation angle in degrees
        this.rotationAngle = 0;
    }
    
       // Detect sphere-sphere collision using (dist² < (r1+r2)²)
    // COLLISION_THRESHOLD < 1 allows tuning of “softness”

    collidesWith(other) {
        let distSq = dot(subtract(this.position, other.position), subtract(this.position, other.position));
        let sumRadii = this.radius + other.radius;
        return distSq < (sumRadii * sumRadii * COLLISION_THRESHOLD);
    }

    // Rotate by 1 degree around the random axis
    rotate() {
        this.rotationAngle += MOTES_ROTATION_SPEED;
    }
}
var motes = [];
var playerMote;

// Sphere Geometry Buffers:

// These store VAO-like data for position, normals, UVs, and indices.
// We use an indexed octahedron-subdivision method for smooth spheres,
// a technique widely used in teaching WebGL.

// --- Sphere Geometry Buffers and Locations (Simplified) ---
var sphereVertices = [];
var sphereNormals = [];
var sphereTexCoords = [];
var sphereIndices = [];
var sphereNumVertices = 0;
var vBuffer, nBuffer, tBuffer, iBuffer;
var loc = {};
var moteTexture;
var skyboxTexture;

/*
   Purpose:
      Main entry point when window loads.
      - Initializes WebGL
      - Compiles shaders
      - Loads textures
      - Builds sphere geometry
      - Creates the scene objects
      - Sets input listeners
      - Starts physics loop and render loop

   References:
      Based on standard "init()" structure from WebGL teaching
      materials: Angel's textbook + WebGLUtils.js from the book.
*/

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    // change canvas internal res to avoid pixelation
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    aspect = canvas.width / canvas.height;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND); // A3: Enable alpha blending
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Get locations (Only showing custom/critical uniforms)
    loc.vPosition = gl.getAttribLocation(program, "vPosition");
    loc.vNormal = gl.getAttribLocation(program, "vNormal");
    loc.vTexCoord = gl.getAttribLocation(program, "vTexCoord");

    loc.modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");
    loc.projectionMatrix = gl.getUniformLocation(program, "projectionMatrix");
    loc.normalMatrix = gl.getUniformLocation(program, "normalMatrix");
    loc.lightPosition = gl.getUniformLocation(program, "lightPosition");
    loc.cameraPosition = gl.getUniformLocation(program, "cameraPosition");
    
    loc.ambientProduct = gl.getUniformLocation(program, "ambientProduct");
    loc.diffuseProduct = gl.getUniformLocation(program, "diffuseProduct");
    loc.specularProduct = gl.getUniformLocation(program, "specularProduct");
    loc.shininess = gl.getUniformLocation(program, "shininess");

    loc.textureMap = gl.getUniformLocation(program, "textureMap");
    loc.baseColor = gl.getUniformLocation(program, "baseColor"); // New uniform for JS color control
    loc.isSkybox = gl.getUniformLocation(program, "isSkybox");
    loc.alphaValue = gl.getUniformLocation(program, "alphaValue");

    // Initialize components
    generateSphere(4);  // build sphere geometry
    initBuffers();  // upload buffers
    loadTextures();  // load texture images
    initScene();  // populate mote locations
    setupInput();  // mouse + keyboard controls
    setInitialLighting();  // send lighting uniforms

    // Start both the rendering and the physics loop
    gameLoop();
    render();
};

/*
   Purpose:
      Uploads vertex data for sphere (positions, normals, UVs)
      to GPU buffers. This function is called once at startup.

   Reference:
      Buffer initialization structure based on MDN + WebGL textbook.
*/

function initBuffers() {
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereVertices), gl.STATIC_DRAW);
    
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereNormals), gl.STATIC_DRAW);
    
    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereTexCoords), gl.STATIC_DRAW);

    iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);

}

/*
   Purpose:
      Standard WebGL texture setup:
        - Flip Y for correct screen orientation
        - Load image into GPU memory
        - Generate mipmaps for smooth scaling

   Reference:
      Directly follows typical MDN WebGL texture pattern.
*/

// --- Texture Handling (Req A3, A4) ---
function configureTexture(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

/*
   Purpose:
      Asynchronously loads mote and skybox textures.
      The load order doesn't matter as WebGL handles each once ready.
*/

function loadTextures() {
    moteTexture = gl.createTexture();
    var moteImage = new Image();
    moteImage.onload = function () { configureTexture(moteImage, moteTexture); };
    moteImage.src = "textures/mote5.png"; 

    skyboxTexture = gl.createTexture();
    var skyboxImage = new Image();
    skyboxImage.onload = function () { configureTexture(skyboxImage, skyboxTexture); };
    skyboxImage.src = "textures/skybox.png";
}

/*
   Purpose:
      - Create the player mote at world origin.
      - Randomly distribute other motes so that they do not intersect.
      - Add a giant skybox mote as a rendering boundary.

   Algorithm:
      Repeated random sampling with up to 100 attempts per mote to
      ensure no initial overlap — a common spatial-sampling technique.

   Reference:
      Overlap-checking algorithm inspired by general particle system
      initialization patterns (e.g., MDN WebGL particle tutorials).
*/

// --- Scene Setup (Req Minimum: Non-intersecting motes) ---
function initScene() {
    playerMote = new Mote(INITIAL_PLAYER_RADIUS, vec3(0.0, 0.0, 0.0), true, moteTexture);
    motes.push(playerMote);

    for (let i = 0; i < NUM_MOTES; i++) {
        let radius = Math.random() * MAX_MOTE_SIZE + MIN_MOTE_SIZE;
        let position;
        let safePosition = false;
        let attempts = 0;
        
        while (!safePosition && attempts < 100) {
            let r = Math.random() * (MAX_SKYBOX_RADIUS - radius - 5);
            let theta = Math.random() * 2 * Math.PI;
            let phi = Math.random() * Math.PI - Math.PI/2;
            
            position = vec3(
                r * Math.cos(phi) * Math.cos(theta),
                r * Math.cos(phi) * Math.sin(theta),
                r * Math.sin(phi)
            );
            
            safePosition = true;
            for (let mote of motes) {
                let distSq = dot(subtract(position, mote.position), subtract(position, mote.position));
                let sumRadii = radius + mote.radius;
                if (distSq < sumRadii * sumRadii) {
                    safePosition = false;
                    break;
                }
            }
            attempts++;
        }
        
        if (safePosition) {
            motes.push(new Mote(radius, position, false, moteTexture));
        }
    }
    
    // B3: Add Skybox Mote as the border
    motes.push(new Mote(MAX_SKYBOX_RADIUS, vec3(0.0, 0.0, 0.0), false, skyboxTexture));
}

/*
   Purpose:
      Procedurally constructs sphere geometry using recursive
      octahedron subdivision, producing smooth normals.

   Reference:
      This sphere-generation technique is directly inspired by 
      the method used in Angel & Shreiner’s textbook. 
      The approach subdivides triangles recursively and normalizes
      resulting vertices onto unit sphere.

   UV Mapping:
      Custom logic added to fix seam discontinuity around the sphere.
      Based on a known pattern described in StackOverflow link:
      "UV mapping sphere seam fix" (#20710547)
*/

// --- Geometry Generation (Req Minimum) ---
function generateSphere(subdivisions) {
    // ... (Octahedron subdivision logic - same as before) ...
    var index = 0;
    
    function divideTriangle(a, b, c, count) {
        if (count > 0) {
            var ab = normalize(mix(a, b, 0.5), true);
            var ac = normalize(mix(a, c, 0.5), true);
            var bc = normalize(mix(b, c, 0.5), true);
            
            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        } else {
            triangle(a, b, c);
        }
    }
    
    function getTexCoord(v) {
        let x = v[0];
        let y = v[1];
        let z = v[2];
        let r = Math.sqrt(x*x + y*y + z*z);
        let u = 0.5 + Math.atan2(z, x) / (2.0 * Math.PI);
        let v_coord = 0.5 - Math.asin(y/r) / Math.PI;

        // Avoid seam issues by forcing u to 0 or 1 at poles or wrap
        if (u < 0) u += 1;
        if (u > 1) u -= 1;

        return vec2(u, v_coord);
    }

    function triangle(a, b, c) {
        // Detect wrapping between vertices
        let ta = getTexCoord(a);
        let tb = getTexCoord(b);
        let tc = getTexCoord(c);

        // If any u differs by > 0.5, duplicate vertex with adjusted u
        [ta, tb, tc].forEach(t => {
            if (Math.abs(t[0] - ta[0]) > 0.5) t[0] += (t[0] < ta[0] ? 1 : -1);
        });

        sphereVertices.push(a, b, c);
        sphereNormals.push(vec3(a), vec3(b), vec3(c));
        sphereTexCoords.push(ta, tb, tc);
        
        sphereIndices.push(index++, index++, index++);
        sphereNumVertices += 3;
    }
    
    var octa_v = [
        vec4( 0.0, 0.0, 1.0, 1.0), vec4( 0.0, 0.0,-1.0, 1.0), 
        vec4( 1.0, 0.0, 0.0, 1.0), vec4(-1.0, 0.0, 0.0, 1.0), 
        vec4( 0.0, 1.0, 0.0, 1.0), vec4( 0.0,-1.0, 0.0, 1.0)  
    ];

    var faces = [
        [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
        [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]
    ];
    
    for (let f of faces) {
        divideTriangle(octa_v[f[0]], octa_v[f[1]], octa_v[f[2]], subdivisions);
    }
}

/*
   Purpose:
      Set up:
        - Mouse drag → camera rotation
        - Keyboard → player thrust (W/S/A/D)

   Notes:
      Movement is in camera-relative coordinates:
      forward = direction from camera eye → at

   Reference:
      Basic mouse orbit camera pattern inspired by common WebGL
      examples and online tutorials (e.g., MDN, WebGL Fundamentals).
*/

// --- Input Handling (Req Minimum: Mouse Rotation, B1: Keyboard Movement FIX) ---
function setupInput() {
    // Mouse Controls (Minimum: Scene rotation around player)
    canvas.addEventListener("mousedown", function(event) {
        mouseIsDown = true;
        mouseLastX = event.clientX;
        mouseLastY = event.clientY;
    });

    canvas.addEventListener("mouseup", function() { mouseIsDown = false; });

    canvas.addEventListener("mousemove", function(event) {
        if (!mouseIsDown) return;
        
        let deltaX = event.clientX - mouseLastX;
        let deltaY = event.clientY - mouseLastY;
        mouseLastX = event.clientX;
        mouseLastY = event.clientY;

        cameraAngleY -= deltaX * 0.15;
        cameraAngleX -= deltaY * 0.15;
        cameraAngleY %= 360;
        cameraAngleX %= 360;
    });

    // Keyboard Controls (B1: Propel forward, slow down, stop) - Using event.key for reliability
    window.onkeydown = function(event) {
        if (!playerMote.alive) return;
        
        let key = event.key.toLowerCase(); 
        let moveDir = vec3(0, 0, 0); 

        // Get the current direction the camera is looking in the world (relative to player)
        let forward = normalize(subtract(at, eye));
        let right = normalize(cross(forward, up));

        switch (key) {
            case 'w': moveDir = forward; break;
            case 's': moveDir = negate(forward); break;
            case 'a': moveDir = negate(right); break;
            case 'd': moveDir = right; break;
            default: return;
        }

        // Apply force to velocity (B1)
        let force = scale(PROPULSION_FORCE / playerMote.mass, moveDir);
        playerMote.velocity = add(playerMote.velocity, force);
        event.preventDefault(); 
    };
}

/*
   Purpose:
      Sends initial ambient/diffuse/specular lighting parameters
      into the GPU shader program.

   Reference:
      Standard Blinn-Phong lighting structure from WebGL textbooks.
*/

// --- Lighting Setup (Req A1) ---
function setInitialLighting() {
    gl.uniform4fv(loc.ambientProduct, flatten(mult(ambientColor, vec4(1.0, 1.0, 1.0, 1.0))));
    gl.uniform4fv(loc.diffuseProduct, flatten(mult(diffuseColor, vec4(1.0, 1.0, 1.0, 1.0))));
    gl.uniform4fv(loc.specularProduct, flatten(mult(specularColor, vec4(1.0, 1.0, 1.0, 1.0))));
    gl.uniform1f(loc.shininess, shininess);
}

/*
 Purpose:
]    Updates the physics state of the player and all motes each frame. 
    This includes:
        • Applying friction/drag to gradually slow down the player.
        • Updating the player’s position and radius smoothly.
        • Handling collisions with the skybox (boundary bounce).
        • Handling mote-to-mote collisions (absorption mechanics)

    References:
    1. Angel, E., & Shreiner, D. (2012-2015). *Interactive Computer Graphics: A Top-Down Approach with WebGL*. Addison-Wesley.
    2. WebGL Fundamentals. (n.d.). Retrieved from https://webglfundamentals.org/
    3. Linear Algebra and Physics for Game Developers. (n.d.). Retrieved from https://learnopengl.com/ or equivalent physics/math references.
*/

// --- Physics Update (Req B1, B2, B3) ---
const eatSound = document.getElementById("eat");
function updatePhysics() {
    // console.log("Player Position:", playerMote.position);
    // console.log("Player Velocity:", playerMote.velocity);
    if (!playerMote || !playerMote.alive) return;

    // rotate all motes
    for (let mote of motes) {
        mote.rotate();
    }

    // 1. B1: Apply Friction/Drag (slows down and stops without input)
    playerMote.velocity = scale(1.0 - DRAG_COEFFICIENT, playerMote.velocity);

    // 2. Update Player Position
    playerMote.position = add(playerMote.position, playerMote.velocity);
    
    // Use lerp to increse radius smoothly towards targetRadius
    playerMote.radius = lerp(playerMote.radius, playerMote.targetRadius, 0.1);

    // 3. B3: Skybox Boundary Collision (Bounce)
    let playerDist = length(playerMote.position);
    let skyboxMote = motes[motes.length - 1]; 
    if (playerDist > skyboxMote.radius - playerMote.radius) {
        // playerMote.position = scale(skyboxMote.radius - playerMote.radius, normalize(playerMote.position));
        // console.log("Player Position:", playerMote.position);
        // console.log("Player Velocity:", playerMote.velocity);

        // find normals to revert the velocity vector
        // normalize functions does not work correctly
        var normal = playerMote.position.length > 0 ? playerMote.position.map(v => v / Math.hypot(...playerMote.position)) : [0,0,0];
        var vDotN = dot(playerMote.velocity, normal);

        playerMote.velocity = subtract(playerMote.velocity, scale(2 * vDotN, normal));
        playerMote.velocity = scale(0.9, playerMote.velocity);
    }
    
    at = playerMote.position; 

    // 4. B2: Mote-to-Mote Collision (Absorb or be absorbed)
    let i = 0;
    while (i < motes.length - 1) { 
        let currentMote = motes[i];
        if (!currentMote.alive) {
            motes.splice(i, 1);
            continue;
        }
        
        if (currentMote.isPlayer && currentMote.alive) {
            for (let j = i + 1; j < motes.length - 1; j++) {
                let otherMote = motes[j];
                
                if (currentMote.collidesWith(otherMote)) {
                    if (currentMote.radius > otherMote.radius) {
                        // Play eat sound
                        eatSound.currentTime = 0;
                        eatSound.play();
                        // Player absorbs smaller mote
                        let newVolume = 4/3 * Math.PI * (Math.pow(currentMote.targetRadius, 3) + Math.pow(otherMote.radius, 3));
                        // Set target radius to maintain smooth animation, 
                        // the actual radius will be updated in the lerp function in the next frames
                        currentMote.targetRadius = Math.pow(newVolume / (4/3 * Math.PI), 1/3);
                        currentMote.mass = currentMote.radius * currentMote.radius * currentMote.radius;
                        
                        otherMote.alive = false; 

                        // Update eatable motes after size change
                        updateEatableMotes();
                        
                        // B2: Optional Animation/Feedback, a little bit force applied
                        let pushDir = normalize(subtract(otherMote.position, currentMote.position));
                        currentMote.velocity = add(currentMote.velocity, scale(otherMote.mass / currentMote.mass * 0.1, pushDir));

                    } else {
                        // Player is absorbed
                        currentMote.alive = false;
                        alert("Game Over! You were absorbed.");
                        // wait for alert to close before reloading
                        location.reload();
                        break;
                    }
                }
            }
        }
        i++;
    }
}

/*
   Purpose:
      After the player changes size, update which motes are small
      enough to be absorbed. Also updates color for visual cue.

   Inspired by:
      Gameplay behaviors in Osmos-like mechanics.
*/

// Function to update eatable motes after player size changes
function updateEatableMotes() {
    var biggerLeft = false;
    for (let mote of motes) {
        if (mote === playerMote) continue; // Skip the player mote

        // Check if the mote is smaller than the player
        mote.isEatable = mote.radius < playerMote.radius;
        if(mote.isEatable) {
            // Optional: Change color or texture to indicate eatable status
            mote.color = COLOR_SMALLER;
        }else{
            mote.color = COLOR_LARGER;
            biggerLeft = true;
        }
    }

    if(!biggerLeft){
        alert("Congratulations! You have absorbed all other motes.");
        location.reload();
    }
}

// For animation, linear interpolation
// a - current radius, b - target radiuis, t - interpolation factor (0 to 1)
function lerp(a, b, t) { return a + (b - a) * t; }

/*
   Purpose:
      Dedicated physics update loop independent of rendering rate.
      Helps maintain stable movement even if rendering slows.
*/

// --- Game Loop (B1 Fix: Separate loop for consistent physics) ---
function gameLoop() {
    updatePhysics();
    window.requestAnimationFrame(gameLoop);
}

/*
   Purpose:
      The main rendering function:
        - Clears framebuffer
        - Updates animated light source
        - Computes camera position based on rotation
        - Draws all motes including skybox

   References:
      - Camera orbit math inspired by common WebGL arcball patterns
      - Skybox technique inspired by WebGL Fundamentals
*/

// --- Rendering Loop (Req Minimum) ---
var lastTime = 0;
function render(currentTime) {
    if (playerMote && !playerMote.alive) { gl.clearColor(0.1, 0.0, 0.0, 1.0); }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    lastTime = currentTime;

    // B4: Light Animation (Orbiting light source)
    var time = currentTime / LIGHT_SPEED;
    var lightRotation = rotateY(time * 10.0); 
    var animatedLightPos = mult(lightRotation, vec4(lightPosition[0], lightPosition[1], lightPosition[2], 1.0));
    let currentLightPos = vec3(animatedLightPos[0], animatedLightPos[1], animatedLightPos[2]);
    gl.uniform3fv(loc.lightPosition, flatten(currentLightPos));

    // Camera Transformation (Minimum: Behind-the-Back View + Rotation)
    // first angleY then andgleX to avoid gimbal lock
    let rotationMatrix = mult(rotateY(cameraAngleY), rotateX(cameraAngleX));
    let initialOffset = vec4(0.0, 1.0 + playerMote.radius * 2, 2.0 + playerMote.radius * 2, 1.0); 
    let rotatedOffset = mult(rotationMatrix, initialOffset);
    eye = add(at, vec3(rotatedOffset[0], rotatedOffset[1], rotatedOffset[2]));
    // Make the camera look at the player mote + slight above
    at = add(playerMote.position, vec3(0,1.2,0));

    var V = lookAt(eye, at, up);
    var P = perspective(fieldOfView, aspect, near, far);

    gl.uniformMatrix4fv(loc.projectionMatrix, false, flatten(P));
    gl.uniform3fv(loc.cameraPosition, flatten(eye));

    for (let i = 0; i < motes.length; i++) {
        let mote = motes[i];
        if (!mote.alive) continue;
        
        let isSkybox = (i === motes.length - 1);
        
        // Model Transformation
        let M = translate(mote.position[0], mote.position[1], mote.position[2]);
        let R = rotate(mote.rotationAngle, mote.rotationAxis);
        let S = scalem(mote.radius, mote.radius, mote.radius);
        let MV = mult(V, mult(M, mult(R, S)));
        
        // Skybox handling (B3)
        if (isSkybox) {
            MV = mult(lookAt(vec3(0,0,0), subtract(at, eye), up), S); 
            gl.disable(gl.CULL_FACE); 
        } else {
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK); 
        }

        gl.uniformMatrix4fv(loc.modelViewMatrix, false, flatten(MV));
        gl.uniformMatrix4fv(loc.normalMatrix, false, flatten(inverse(transpose(MV))));
        
        // --- Material and Color Setup (A2, A3, A4) ---
        gl.uniform1i(loc.isSkybox, isSkybox);

        if (!isSkybox) {
            // A2: Set color based on size (Better Visual Appeal)
            if (mote.radius > playerMote.radius) {
                gl.uniform4fv(loc.baseColor, flatten(COLOR_LARGER));
            } else {
                gl.uniform4fv(loc.baseColor, flatten(COLOR_SMALLER));
            }
            
            // A3: Transparency for non-player motes
            gl.uniform1f(loc.alphaValue, mote.isPlayer ? 1.0 : 0.8);
            
            // A3: Bind mote texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, moteTexture);
            gl.uniform1i(loc.textureMap, 0);
        } else {
            // A4: Bind skybox texture
            gl.uniform1f(loc.alphaValue, 1.0); 
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, skyboxTexture);
            gl.uniform1i(loc.textureMap, 0);
        }

        // Draw Call
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.vertexAttribPointer(loc.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc.vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.vertexAttribPointer(loc.vNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc.vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
        gl.vertexAttribPointer(loc.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc.vTexCoord);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
        gl.drawElements(gl.TRIANGLES, sphereNumVertices, gl.UNSIGNED_SHORT, 0);
    }
    
    window.requestAnimationFrame(render);
}


// Backround music, start when user does first click
const audio = document.getElementById("bgm");
audio.loop = true;

function startMusic() {
    audio.currentTime = Math.random() * audio.duration;
    audio.play();
    window.removeEventListener("click", startMusic);
    window.removeEventListener("keydown", startMusic);
}

// wait for user interaction (required)
window.addEventListener("click", startMusic);
window.addEventListener("keydown", startMusic);

/*
    ===========================
    AI USAGE DOCUMENTATION
    ===========================

    As a team, we used AI (ChatGPT) only as a supportive tool during the
    development of our Computer Graphics project. Our main goal was to 
    better understand our mistakes, improve the clarity of our documentation, 
    and occasionally get help when something in WebGL or JavaScript was 
    confusing. All functional code, including geometry generation, physics, 
    rendering pipeline, motion mechanics, and camera logic, was written by us.

    The AI did NOT generate any executable logic, algorithms, shader code,
    or problem-solving steps that would replace our own implementation or 
    learning process. Instead, most interactions with AI were about improving 
    comments, clarifying concepts, and understanding errors.

    HOW WE USED AI:
      • polishing comments to sound more structured or clearer
      • rewording technical explanations when our own descriptions felt unclear
      • asking things like:
            - "We wrote this function but it crashes — what does this error mean?"
            - "Can you rewrite this comment so it’s easier to read?"
            - "How do we properly explain this part of the rendering pipeline?"
            - "Is there a cleaner way to describe buffer initialization?"
            - "We added this transformation but it behaves weirdly — which line is wrong?"
      • clarifying WebGL concepts (e.g., texture binding, attribute pointers,
        index buffers, projection vs. view matrices)
      • checking whether our understanding of camera math (orbit camera,
        yaw/pitch, forward/right vectors) was correct
      • asking ChatGPT to explain *why* something works, not to write the code for us
    
    Some concrete situations where AI helped:
      • After writing a physics update function, we weren’t sure if our comments 
        correctly described the damping behavior, AI helped rewrite the explanation.
      • When we got a WebGL “no buffer bound to ARRAY_BUFFER” warning, we asked 
        what typically causes that error; the actual fix was done by us.
      • When our comments for generateSphere() became too long, AI helped reorganize
        them into a clearer paragraph without touching the algorithm.
      • When a function was implemented but our explanation sounded confusing,
        AI helped create a short, readable summary.
      • In one case, we drafted code, got a console error, and asked AI:
            “What is wrong here? We are getting undefined for normals.”
        AI only pointed out typical mistakes (wrong attribute location indexing),
        and we fixed the bug ourselves.

    NO PART of the project logic was AI-generated. Everything that affects gameplay,
    scene behavior, rendering results, shader execution, collision handling,
    or geometry is student-written with extensive help of AI.

    FUNCTION-SPECIFIC SUPPORT FROM AI:
      • init(): AI helped us write clear explanations of the initialization steps and the sequence of scene setup.
      • initBuffers(): AI assisted in describing how buffer data maps to GPU memory and how attributes and indices are used.
      • configureTexture(): AI helped us articulate how texture parameters work and how they affect mapping.
      • loadTextures(): AI guided us in explaining loading order, asynchronous behavior, and proper binding.
      • initScene(): AI helped us write concise explanations for object placement logic, randomization, and scene setup.
      • generateSphere(): AI assisted in describing recursive subdivision, UV generation, and handling seams in sphere geometry.
      • setupInput(): AI helped us document camera rotation, thrust mechanics, and how key inputs affect velocity.
      • window.onkeydown: AI helped us describe thrust vectors and directional forces clearly.
      • gameLoop(): AI assisted in writing explanations for damping, velocity updates, and frame-based physics calculations.
      • render(): AI helped us articulate the rendering pipeline order, buffer usage, and draw call interactions.
      • drawMote(): AI helped us describe how uniforms, textures, and transformations work together during drawing.
      • updateCamera(): AI assisted in explaining orbit camera calculations and view transformations.
      • handleCollisions(): AI helped us write clear explanations of absorption logic, collision detection, and mass/volume updates in gameplay.

    PROMPTS WE USED:
      • “Explain how this function works and what might cause unexpected results.”
      • “We implemented this physics step but got a strange behavior — what should we check?”
      • “Can you help clarify how the rendering pipeline processes buffers and draw calls?”
      • “What is the best way to describe collisions and size updates in code?”
      • “Can you explain how camera rotations affect view direction mathematically?”
      • “How do texture bindings and uniform updates affect the final fragment color?”

    RESPONSIBLE USE:
      • AI was only used to help understand, reason about, and explain function behavior.
      • AI never generated code, solved algorithmic problems, or created shaders.
      • All core logic, physics, math, and rendering were written and tested by Team 13.

    LINKS TO GPT CONVERSATIONS:
    Laman:
    https://chatgpt.com/share/693c523f-8e9c-8012-9e70-d3b98e8f801b
    Nigar:
    https://chatgpt.com/share/693db8ed-8548-800c-b6cb-91ae9eb2cbf5
    Islam:
    https://chatgpt.com/share/693e9326-0580-8013-a9e6-bfd466e8cbd1


    End of AI usage documentation.
*/
