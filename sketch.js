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

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(displayDensity());

    // Detect system dark mode
    darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    initScaleAndSizes();
    initPositions();
    initVelocities();
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

    // Handle movement 
    // We pass shape type and dimensions to calculate edges correctly
    handleMovement('rect1', rect1Width, rect1Height);
    handleMovement('rect2', rect2Width, rect2Height);
    handleMovement('ellipse1', ellipse1Width, ellipse1Height);
    handleMovement('ellipse2', ellipse2Width, ellipse2Height);
    handleMovement('tri', triWidth, triHeight);
    handleMovement('pent', pentRadius, pentRadius); // For pentagon, w/h are both radius

    drawShapes();
}

function drawShapes() {
    if (darkMode) {
        fill(255, 160, 160); rect(rect1X, rect1Y, rect1Width, rect1Height);
        fill(160, 255, 160); rect(rect2X, rect2Y, rect2Width, rect2Height);
        fill(160, 200, 255); ellipse(ellipse1X, ellipse1Y, ellipse1Width, ellipse1Height);
        fill(200, 160, 255); ellipse(ellipse2X, ellipse2Y, ellipse2Width, ellipse2Height);
        // Triangle drawn: Top Point (x,y), then Left-Bottom, Right-Bottom
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
    if (key === '3') resetPositions();
}

function resetPositions() {
    let cx = width / 2;
    let cy = height / 2;
    // Reset specific variables to center
    // Adjust for Rects (drawn from top-left) vs others (drawn from center/top)
    rect1X = cx - rect1Width/2; rect1Y = cy - rect1Height/2;
    rect2X = cx - rect2Width/2; rect2Y = cy - rect2Height/2;
    ellipse1X = cx; ellipse1Y = cy;
    ellipse2X = cx; ellipse2Y = cy;
    triX = cx; triY = cy - triHeight/2;
    pentX = cx; pentY = cy;
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

function handleMovement(shape, w, h) {
    let x, y, vx, vy;
    // 1. Get current values
    if (shape === 'rect1') { x = rect1X; y = rect1Y; vx = rect1VX; vy = rect1VY; }
    else if (shape === 'rect2') { x = rect2X; y = rect2Y; vx = rect2VX; vy = rect2VY; }
    else if (shape === 'ellipse1') { x = ellipse1X; y = ellipse1Y; vx = ellipse1VX; vy = ellipse1VY; }
    else if (shape === 'ellipse2') { x = ellipse2X; y = ellipse2Y; vx = ellipse2VX; vy = ellipse2VY; }
    else if (shape === 'tri') { x = triX; y = triY; vx =
