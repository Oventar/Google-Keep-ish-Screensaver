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
let mode = 'bounce'; // UPDATED: Default is now bounce
let darkMode = false;

// Stuck Detection 
let shapeTrackers = {}; 

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(displayDensity());
    darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    initScaleAndSizes();
    initPositions();
    initVelocities();
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

    // Move shapes
    rect1X += rect1VX; rect1Y += rect1VY;
    rect2X += rect2VX; rect2Y += rect2VY;
    ellipse1X += ellipse1VX; ellipse1Y += ellipse1VY;
    ellipse2X += ellipse2VX; ellipse2Y += ellipse2VY;
    triX += triVX; triY += triVY;
    pentX += pentVX; pentY += pentVY;

    // Boundary & Stuck Logic
    handleMovement('rect1', rect1Width, rect1Height, rect1X, rect1Y);
    handleMovement('rect2', rect2Width, rect2Height, rect2X, rect2Y);
    handleMovement('ellipse1', ellipse1Width, ellipse1Height, ellipse1X, ellipse1Y);
    handleMovement('ellipse2', ellipse2Width, ellipse2Height, ellipse2X, ellipse2Y);
    handleMovement('tri', triWidth, triHeight, triX, triY);
    handleMovement('pent', pentRadius * 2, pentRadius * 2, pentX, pentY);

    drawShapes();
    handleGlobalStuckLogic();
}

function handleMovement(shape, w, h, x, y) {
    let v = getVelocities(shape);
    let vx = v.vx;
    let vy = v.vy;

    updateStuckTracker(shape, x, y);

    let edgeL, edgeR, edgeT, edgeB;
    
    // Calculate edges based on shape type
    if (shape.includes('rect')) {
        // Rects draw from top-left
        edgeL = x; edgeR = x + w; edgeT = y; edgeB = y + h;
    } else if (shape === 'tri') {
        // Triangle draws from top tip (x,y)
        edgeL = x - w/2; edgeR = x + w/2; edgeT = y; edgeB = y + h;
    } else if (shape === 'pent') {
        let pOffsetBottom = pentRadius * cos(PI/5); 
        let pOffsetSide = pentRadius * sin(TWO_PI/5);
        edgeL = x - pOffsetSide;
        edgeR = x + pOffsetSide;
        edgeT = y - pentRadius; 
        edgeB = y + pOffsetBottom;
    } else {
        // Ellipses draw from center
        edgeL = x - w/2; edgeR = x + w/2; edgeT = y - h/2; edgeB = y + h/2;
    }

    if (mode === 'bounce') {
        // UPDATED BOUNCE LOGIC
        // We push the object back inside the bounds AND force the velocity direction
        
        // Right Edge
        if (edgeR > width) { 
            x -= (edgeR - width); // Push back inside
            vx = -Math.abs(vx);   // Force velocity LEFT
        }
        // Left Edge
        else if (edgeL < 0) { 
            x += -edgeL;          // Push back inside
            vx = Math.abs(vx);    // Force velocity RIGHT
        }

        // Bottom Edge
        if (edgeB > height) { 
            y -= (edgeB - height);// Push back inside
            vy = -Math.abs(vy);   // Force velocity UP
        }
        // Top Edge
        else if (edgeT < 0) { 
            y += -edgeT;          // Push back inside
            vy = Math.abs(vy);    // Force velocity DOWN
        }
    } else {
        // Wrap logic
        if (edgeL > width) x = -w/2;
        else if (edgeR < 0) x = width + w/2;
        if (edgeT > height) y = -h/2;
        else if (edgeB < 0) y = height + h/2;
    }

    setVelocities(shape, vx, vy);
    updateGlobalPos(shape, x, y);
}

function keyPressed() {
    if (key === '1') darkMode = !darkMode;
    if (key === '2') mode = (mode === 'wrap') ? 'bounce' : 'wrap';
    if (key === '3' || key === 'r' || key === 'R') resetToCenter();
    if (key === 'o' || key === 'O') outlinesOn = !outlinesOn;
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
    
    initVelocities(); // Randomizes directions/speeds
    initTrackers();   // Resets the 10s timers
}

function handleGlobalStuckLogic() {
    let maxStuckTime = 0;
    for (let key in shapeTrackers) {
        let timeStuck = millis() - shapeTrackers[key].lastMoveTime;
        if (timeStuck > maxStuckTime) maxStuckTime = timeStuck;
    }
    if (maxStuckTime > 7000) {
        let remaining = Math.ceil((10000 - maxStuckTime) / 1000);
        textAlign(CENTER, CENTER); 
        textSize(40 * Scale); 
        fill(darkMode ? 255 : 0);
        noStroke();
        text("STUCK SHAPE DETECTED", width/2, height/2 - 50*Scale);
        textSize(80 * Scale); 
        text("RESET IN " + max(0, remaining), width/2, height/2 + 50*Scale);
        
        if (maxStuckTime > 10000) {
            resetToCenter(); 
        }
    }
}

function initTrackers() {
    ['rect1', 'rect2', 'ellipse1', 'ellipse2', 'tri', 'pent'].forEach(s => {
        shapeTrackers[s] = { lastX: 0, lastY: 0, lastMoveTime: millis() };
    });
}

function updateStuckTracker(shape, currentX, currentY) {
    let t = shapeTrackers[shape];
    if (Math.abs(currentX - t.lastX) > 15 || Math.abs(currentY - t.lastY) > 15) {
        t.lastX = currentX; t.lastY = currentY; t.lastMoveTime = millis();
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

function initScaleAndSizes() {
    Scale = max(1, min(width, height) / 600);
    V = 2.0 * Scale;
    rect1Width = 50 * Scale; rect1Height = 60 * Scale;
    rect2Width = 30 * Scale; rect2Height = 30 * Scale;
    ellipse1Width = 30 * Scale; ellipse1Height = 30 * Scale;
    ellipse2Width = 45 * Scale; ellipse2Height = 45 * Scale;
    triWidth = 40 * Scale; triHeight = triWidth * Math.sqrt(3) / 2;
    pentRadius = 25 * Scale;
}

function initPositions() {
    rect1X = random(width); rect1Y = random(height);
    rect2X = random(width); rect2Y = random(height);
    ellipse1X = random(width); ellipse1Y = random(height);
    ellipse2X = random(width); ellipse2Y = random(height);
    triX = random(width); triY = random(height);
    pentX = random(width); pentY = random(height);
}

function initVelocities() {
    rect1VX = random(-V, V); rect1VY = random(-V, V);
    rect2VX = random(-V, V); rect2VY = random(-V, V);
    ellipse1VX = random(-V, V); ellipse1VY = random(-V, V);
    ellipse2VX = random(-V, V); ellipse2VY = random(-V, V);
    triVX = random(-V, V); triVY = random(-V, V);
    pentVX = random(-V, V); pentVY = random(-V, V);
}

function getVelocities(s) {
    if(s==='rect1') return {vx:rect1VX, vy:rect1VY};
    if(s==='rect2') return {vx:rect2VX, vy:rect2VY};
    if(s==='ellipse1') return {vx:ellipse1VX, vy:ellipse1VY};
    if(s==='ellipse2') return {vx:ellipse2VX, vy:ellipse2VY};
    if(s==='tri') return {vx:triVX, vy:triVY};
    if(s==='pent') return {vx:pentVX, vy:pentVY};
}

function setVelocities(s, vx, vy) {
    if(s==='rect1') {rect1VX=vx; rect1VY=vy;}
    if(s==='rect2') {rect2VX=vx; rect2VY=vy;}
    if(s==='ellipse1') {ellipse1VX=vx; ellipse1VY=vy;}
    if(s==='ellipse2') {ellipse2VX=vx; ellipse2VY=vy;}
    if(s==='tri') {triVX=vx; triVY=vy;}
    if(s==='pent') {pentVX=vx; pentVY=vy;}
}

function updateGlobalPos(s, x, y) {
    if(s==='rect1') {rect1X=x; rect1Y=y;}
    else if(s==='rect2') {rect2X=x; rect2Y=y;}
    else if(s==='ellipse1') {ellipse1X=x; ellipse1Y=y;}
    else if(s==='ellipse2') {ellipse2X=x; ellipse2Y=y;}
    else if(s==='tri') {triX=x; triY=y;}
    else if(s==='pent') {pentX=x; pentY=y;}
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    initScaleAndSizes();
}
