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
let mode = 'bounce'; 
let darkMode = false;

// Stuck Detection 
let shapeTrackers = {}; 

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(displayDensity());
    darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // IMPORTANT FIX: This treats rectangles like ellipses (anchored at center).
    // This fixes the teleporting loop bugs.
    rectMode(CENTER); 

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
    // Note: widths/heights are now treated as full dimensions centered on X/Y
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

    // Because we used rectMode(CENTER), calculation is the same for ALL shapes now
    let halfW = w / 2;
    let halfH = h / 2;

    // Edges
    let edgeL = x - halfW;
    let edgeR = x + halfW;
    let edgeT = y - halfH;
    let edgeB = y + halfH;
    
    // Pentagon specific adjustment for accuracy (optional, but keeps it tight)
    if (shape === 'pent') {
        let pRad = w/2;
        edgeT = y - pRad;
        edgeB = y + pRad; 
        edgeL = x - pRad;
        edgeR = x + pRad;
    }

    if (mode === 'bounce') {
        // --- BOUNCE LOGIC ---
        if (edgeR > width) { 
            x = width - halfW; 
            vx = -Math.abs(vx);   
        }
        else if (edgeL < 0) { 
            x = halfW;          
            vx = Math.abs(vx);    
        }
        if (edgeB > height) { 
            y = height - halfH;
            vy = -Math.abs(vy);   
        }
        else if (edgeT < 0) { 
            y = halfH;          
            vy = Math.abs(vy);    
        }
    } else {
        // --- SMOOTH WRAP LOGIC ---
        // We only "teleport" the X/Y when the shape is FULLY off screen.
        // The drawShapes() function handles the visual "ghost" so it looks smooth.
        
        let bufferX = halfW * 1.5; // Extra buffer to ensure it clears screen
        let bufferY = halfH * 1.5;

        if (x > width + bufferX) x = -bufferX;
        else if (x < -bufferX) x = width + bufferX;
        
        if (y > height + bufferY) y = -bufferY;
        else if (y < -bufferY) y = height + bufferY;
    }

    setVelocities(shape, vx, vy);
    updateGlobalPos(shape, x, y);
}

// --- VISUAL RENDERING WITH GHOSTS ---
function drawShapes() {
    // We create a helper that draws the shape at (x,y) AND at offset positions
    // if we are in wrap mode.
    
    let drawRect1 = () => rect(0, 0, rect1Width, rect1Height);
    let drawRect2 = () => rect(0, 0, rect2Width, rect2Height);
    let drawEll1 = () => ellipse(0, 0, ellipse1Width, ellipse1Height);
    let drawEll2 = () => ellipse(0, 0, ellipse2Width, ellipse2Height);
    let drawTri = () => triangle(0, 0, -triWidth / 2, triHeight, triWidth / 2, triHeight);
    let drawPent = () => drawPentagon(0, 0, pentRadius);

    // Colors
    let cR1 = darkMode ? color(255, 160, 160) : color(255, 105, 97);
    let cR2 = darkMode ? color(160, 255, 160) : color(144, 238, 144);
    let cE1 = darkMode ? color(160, 200, 255) : color(100, 149, 237);
    let cE2 = darkMode ? color(200, 160, 255) : color(186, 85, 211);
    let cT  = darkMode ? color(255, 220, 100) : color(255, 215, 0);
    let cP  = darkMode ? color(255, 180, 80) : color(255, 165, 0);

    // Render with Wrappers
    renderWrapped(rect1X, rect1Y, rect1Width, rect1Height, cR1, drawRect1);
    renderWrapped(rect2X, rect2Y, rect2Width, rect2Height, cR2, drawRect2);
    renderWrapped(ellipse1X, ellipse1Y, ellipse1Width, ellipse1Height, cE1, drawEll1);
    renderWrapped(ellipse2X, ellipse2Y, ellipse2Width, ellipse2Height, cE2, drawEll2);
    
    // Adjust Y offset for Triangle because drawn from top-tip relative to center logic
    push();
    translate(triX, triY);
    // Visual adjustment to center the visual weight of the triangle
    translate(0, -triHeight/2); 
    // We pass 0,0 here because we already translated
    renderWrapped(0, 0, triWidth, triHeight, cT, drawTri, true); 
    pop();

    renderWrapped(pentX, pentY, pentRadius*2, pentRadius*2, cP, drawPent);
}

// Helper to draw the main shape PLUS "ghosts" on the other side if needed
function renderWrapped(x, y, w, h, col, drawFn, isRelative = false) {
    fill(col);
    
    // 1. Draw Original
    if(!isRelative) {
        push();
        translate(x, y);
        drawFn();
        pop();
    } else {
        // If already translated (like the triangle fix), just draw
        drawFn();
    }

    // 2. If WRAP mode, draw Ghosts
    if (mode === 'wrap') {
        let ghostPositions = [];

        // Check horizontal overlap
        // If overlapping Right Edge, draw Ghost on Left
        if (x + w/2 > width) ghostPositions.push({ox: -width, oy: 0});
        // If overlapping Left Edge, draw Ghost on Right
        if (x - w/2 < 0) ghostPositions.push({ox: width, oy: 0});
        
        // Check vertical overlap
        // If overlapping Bottom, draw Ghost on Top
        if (y + h/2 > height) ghostPositions.push({ox: 0, oy: -height});
        // If overlapping Top, draw Ghost on Bottom
        if (y - h/2 < 0) ghostPositions.push({ox: 0, oy: height});

        // Corner Cases (Diagonal Ghosts) - if near a corner, we might need a diagonal ghost
        // E.g., Top-Left corner needs a Ghost at Bottom-Right
        if ((x - w/2 < 0) && (y - h/2 < 0)) ghostPositions.push({ox: width, oy: height});
        if ((x + w/2 > width) && (y - h/2 < 0)) ghostPositions.push({ox: -width, oy: height});
        if ((x - w/2 < 0) && (y + h/2 > height)) ghostPositions.push({ox: width, oy: -height});
        if ((x + w/2 > width) && (y + h/2 > height)) ghostPositions.push({ox: -width, oy: -height});

        for (let gp of ghostPositions) {
            push();
            if(isRelative) {
                translate(gp.ox, gp.oy);
            } else {
                translate(x + gp.ox, y + gp.oy);
            }
            drawFn();
            pop();
        }
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

// --- INPUT & UTILS ---

function keyPressed() {
    if (key === '1') darkMode = !darkMode;
    if (key === '2') mode = (mode === 'wrap') ? 'bounce' : 'wrap';
    if (key === '3' || key === 'r' || key === 'R') resetToCenter();
    if (key === 'o' || key === 'O') outlinesOn = !outlinesOn;
}

function resetToCenter() {
    let cx = width / 2;
    let cy = height / 2;
    // With rectMode(CENTER), positions are simply center of screen
    rect1X = cx; rect1Y = cy;
    rect2X = cx; rect2Y = cy;
    ellipse1X = cx; ellipse1Y = cy;
    ellipse2X = cx; ellipse2Y = cy;
    triX = cx; triY = cy;
    pentX = cx; pentY = cy;
    
    initVelocities(); 
    initTrackers();   
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
