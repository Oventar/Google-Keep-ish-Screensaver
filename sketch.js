let Scale;

// Position variables
let rect1X, rect1Y, rect1Width, rect1Height;
let rect2X, rect2Y, rect2Width, rect2Height;
let ellipse1X, ellipse1Y, ellipse1Width, ellipse1Height;
let ellipse2X, ellipse2Y, ellipse2Width, ellipse2Height;
let triX, triY, triWidth, triHeight;
let pentX, pentY, pentRadius;

// Velocity variables
let rect1VX, rect1VY;
let rect2VX, rect2VY;
let ellipse1VX, ellipse1VY;
let ellipse2VX, ellipse2VY;
let triVX, triVY;
let pentVX, pentVY;
let V;

let outlinesOn = false;
let mode = 'wrap';
let darkMode = false;

// Stuck Detection Variables
let shapeTrackers = {}; // Object to store history for each shape
let stuckWarningActive = false;
let countdownValue = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(displayDensity());

    // Detect system dark mode
    darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    initScaleAndSizes();
    initPositions();
    initVelocities();
    
    // Initialize the stuck trackers
    initTrackers();
}

function draw() {
    background(darkMode ? 34 : 240);

    if (outlinesOn) {
        stroke(50, 50, 50, 100);
        strokeWeight(2);
    } else {
        noStroke();
    }

    // Update positions
    rect1X += rect1VX; rect1Y += rect1VY;
    rect2X += rect2VX; rect2Y += rect2VY;
    ellipse1X += ellipse1VX; ellipse1Y += ellipse1VY;
    ellipse2X += ellipse2VX; ellipse2Y += ellipse2VY;
    triX += triVX; triY += triVY;
    pentX += pentVX; pentY += pentVY;

    // Handle movement (Bounce/Wrap) & Stuck Checks
    // We pass the variable names as strings to map them to the trackers
    handleMovement('rect1', rect1Width, rect1Height, rect1X, rect1Y);
    handleMovement('rect2', rect2Width, rect2Height, rect2X, rect2Y);
    handleMovement('ellipse1', ellipse1Width, ellipse1Height, ellipse1X, ellipse1Y);
    handleMovement('ellipse2', ellipse2Width, ellipse2Height, ellipse2X, ellipse2Y);
    handleMovement('tri', triWidth, triHeight, triX, triY);
    handleMovement('pent', pentRadius*2, pentRadius*2, pentX, pentY);

    drawShapes();
    
    // Handle the stuck countdown logic
    handleGlobalStuckLogic();
}

function handleGlobalStuckLogic() {
    let maxStuckTime = 0;
    let currentTime = millis();
    
    // Check all trackers to see who is stuck the longest
    for (let key in shapeTrackers) {
        let tracker = shapeTrackers[key];
        let timeStuck = currentTime - tracker.lastMoveTime;
        if (timeStuck > maxStuckTime) {
            maxStuckTime = timeStuck;
        }
    }

    // If anyone has been stuck for more than 7 seconds, show warning
    if (maxStuckTime > 7000) {
        let remaining = Math.ceil((10000 - maxStuckTime) / 1000);
        
        // Draw Warning Text
        textAlign(CENTER, CENTER);
        textSize(40 * Scale);
        fill(darkMode ? 255 : 0);
        noStroke();
        text("STUCK SHAPE DETECTED", width/2, height/2 - 50*Scale);
        textSize(80 * Scale);
        text("RESET IN " + remaining, width/2, height/2 + 50*Scale);
        
        // If stuck for 10 seconds, RESET
        if (maxStuckTime > 10000) {
            resetToCenter();
        }
    }
}

function initTrackers() {
    let shapes = ['rect1', 'rect2', 'ellipse1', 'ellipse2', 'tri', 'pent'];
    shapes.forEach(s => {
        shapeTrackers[s] = {
            lastX: 0,
            lastY: 0,
            lastMoveTime: millis()
        };
    });
}

function updateStuckTracker(shape, currentX, currentY) {
    let t = shapeTrackers[shape];
    if (!t) return;

    // Distance threshold (20px)
    let distMovedX = Math.abs(currentX - t.lastX);
    let distMovedY = Math.abs(currentY - t.lastY);

    // If the shape has moved significantly on EITHER axis, reset the timer
    // This handles cases where it's bouncing horizontally (Y doesn't change) 
    // or vertically (X doesn't change).
    if (distMovedX > 20 || distMovedY > 20) {
        t.lastX = currentX;
        t.lastY = currentY;
        t.lastMoveTime = millis();
    }
}

function drawShapes() {
    if (darkMode) {
        fill(255, 160, 160); rect(rect1X, rect1Y, rect1Width, rect1Height);
        fill(160, 255, 160); rect(rect2X, rect2Y, rect2Width, rect2Height);
        fill(160, 200, 255); ellipse(ellipse1X, ellipse1Y, ellipse1Width, ellipse1Height);
        fill(200, 160, 255); ellipse(ellipse2X, ellipse2Y, ellipse2Width, ellipse2Height);
        fill(255, 220, 100); triangle(triX, triY, triX - triWidth / 2, triY + triHeight, triX + triWidth / 2, triY + triHeight);
        fill(255, 180, 80); drawPentagon(pentX, pentY, pentRadius);
    } else {
        fill(255, 105, 97); rect(rect1X, rect1Y, rect1Width, rect1Height);
        fill(144, 238, 144); rect(rect2X, rect2Y, rect2Width, rect2Height);
        fill(100, 149, 237); ellipse(ellipse1X, ellipse1Y, ellipse1Width, ellipse1Height);
        fill(186, 85, 211); ellipse(ellipse2X, ellipse2Y, ellipse2Width, ellipse2Height);
        fill(255, 215, 0); triangle(triX, triY, triX - triWidth / 2, triY + triHeight, triX + triWidth / 2, triY + triHeight);
        fill(255, 165, 0); drawPentagon(pentX, pentY, pentRadius);
    }
}

function drawPentagon(x, y, radius) {
    let angle = TWO_PI / 5;
    beginShape();
    for (let i = 0; i < 5; i++) {
        let px = x + cos(angle * i - PI / 2) * radius;
        let py = y + sin(angle * i - PI / 2) * radius;
        vertex(px, py);
    }
    endShape(CLOSE);
}

function keyPressed() {
    if (key === 'O' || key === 'o') outlinesOn = !outlinesOn;
    if (key === '1') darkMode = !darkMode;
    if (key === '2') mode = (mode === 'wrap') ? 'bounce' : 'wrap';
    if (key === '3') resetToCenter();
}

function resetToCenter() {
    let cx = width / 2;
    let cy = height / 2;
    
    rect1X = cx - rect1Width/2; rect1Y = cy - rect1Height/2;
    rect2X = cx - rect2Width/2; rect2Y = cy - rect2Height/2;
    ellipse1X = cx; ellipse1Y = cy;
    ellipse2X = cx; ellipse2Y = cy;
    triX = cx; triY = cy - triHeight/2;
    pentX = cx; pentY = cy;
    
    initVelocities(); // Give them new random directions
    initTrackers();   // Reset the stuck timers
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    initScaleAndSizes();
}

function initScaleAndSizes() {
    Scale = max(1, min(width, height) / 600);
    V = 1.5 * Scale;

    rect1Width = 50 * Scale; rect1Height = 60 * Scale;
    rect2Width = 30 * Scale; rect2Height = 30 * Scale;
    ellipse1Width = 30 * Scale; ellipse1Height = 30 * Scale;
    ellipse2Width = 45 * Scale; ellipse2Height = 45 * Scale;
    triWidth = 40 * Scale; triHeight = triWidth * Math.sqrt(3) / 2;
    pentRadius = 25 * Scale;
}

function initPositions() {
    rect1X = random(0, width); rect1Y = random(0, height);
    rect2X = random(0, width); rect2Y = random(0, height);
    ellipse1X = random(0, width); ellipse1Y = random(0, height);
    ellipse2X = random(0, width); ellipse2Y = random(0, height);
    triX = random(0, width); triY = random(0, height);
    pentX = random(0, width); pentY = random(0, height);
}

function initVelocities() {
    rect1VX = random(-V, V); rect1VY = random(-V, V);
    rect2VX = random(-V, V); rect2VY = random(-V, V);
    ellipse1VX = random(-V, V); ellipse1VY = random(-V, V);
    ellipse2VX = random(-V, V); ellipse2VY = random(-V, V);
    triVX = random(-V, V); triVY = random(-V, V);
    pentVX = random(-V, V); pentVY = random(-V, V);
}

// Helper to get current Velocity for a shape
function getVelocities(shape) {
    if(shape==='rect1') return {vx:rect1VX, vy:rect1VY};
    if(shape==='rect2') return {vx:rect2VX, vy:rect2VY};
    if(shape==='ellipse1') return {vx:ellipse1VX, vy:ellipse1VY};
    if(shape==='ellipse2') return {vx:ellipse2VX, vy:ellipse2VY};
    if(shape==='tri') return {vx:triVX, vy:triVY};
    if(shape==='pent') return {vx:pentVX, vy:pentVY};
    return {vx:0, vy:0};
}

// Helper to set Velocity for a shape
function setVelocities(shape, vx, vy) {
    if(shape==='rect1') {rect1VX=vx; rect1VY=vy;}
    if(shape==='rect2') {rect2VX=vx; rect2VY=vy;}
    if(shape==='ellipse1') {ellipse1VX=vx; ellipse1VY=vy;}
    if(shape==='ellipse2') {ellipse2VX=vx; ellipse2VY=vy;}
    if(shape==='tri') {triVX=vx; triVY=vy;}
    if(shape==='pent') {pentVX=vx; pentVY=vy;}
}

function handleMovement(shape, w, h, x, y) {
    let v = getVelocities(shape);
    let vx = v.vx;
    let vy = v.vy;

    // Update stuck tracker for this shape
    updateStuckTracker(shape, x, y);

    // Calculate Exact Edges based on draw mode
    let edgeL, edgeR, edgeT, edgeB;
    
    if (shape.includes('rect')) {
        // TOP-LEFT corner draw mode
        edgeL = x; edgeR = x + w; edgeT = y; edgeB = y + h;
    } else if (shape === 'tri') {
        // TOP-CENTER draw mode
        edgeL = x - w/2; edgeR = x + w/2; edgeT = y; edgeB = y + h;
    } else {
        // CENTER draw mode (Ellipse/Pentagon)
        // Note: For pentagon, w passed in was Radius*2, so w/2 is radius
        edgeL = x - w/2; edgeR = x + w/2; edgeT = y - h/2; edgeB = y + h/2;
    }

    if (mode === 'wrap') {
        // Wrap Logic
        if (edgeL > width) { // Gone off right
            x -= (width + w + 10); // Wrap to left
        } else if (edgeR < 0) { // Gone off left
            x += (width + w + 10); // Wrap to right
        }
        if (edgeT > height) { // Gone off bottom
            y -= (height + h + 10);
        } else if (edgeB < 0) { // Gone off top
            y += (height + h + 10);
        }
    } else {
        // --- PRECISE BOUNCE LOGIC ---
        // 1. Check Collision
        // 2. HARD RESET position to exactly the border (prevents vibrating)
        // 3. Flip Velocity

        // Right Wall
        if (edgeR > width) {
            let offset = edgeR - x; // Distance from center/corner to right edge
            x = width - offset;     // Snap exactly to wall
            vx *= -1;
        }
        // Left Wall
        else if (edgeL < 0) {
            let offset = x - edgeL; // Distance from center/corner to left edge
            x = 0 + offset;         // Snap exactly to wall
            vx *= -1;
        }

        // Bottom Wall
        if (edgeB > height) {
            let offset = edgeB - y;
            y = height - offset;
            vy *= -1;
        }
        // Top Wall
        else if (edgeT < 0) {
            let offset = y - edgeT;
            y = 0 + offset;
            vy *= -1;
        }
    }

    // Apply calculated X, Y and velocities back to global variables
    setVelocities(shape, vx, vy);
    
    if(shape==='rect1') {rect1X=x; rect1Y=y;}
    else if(shape==='rect2') {rect2X=x; rect2Y=y;}
    else if(shape==='ellipse1') {ellipse1X=x; ellipse1Y=y;}
    else if(shape==='ellipse2') {ellipse2X=x; ellipse2Y=y;}
    else if(shape==='tri') {triX=x; triY=y;}
    else if(shape==='pent') {pentX=x; pentY=y;}
}
