let Scale;

// Position variables
let rect1X, rect1Y, rect1Width, rect1Height;
let rect2X, rect2Y, rect2Width, rect2Height;
let ellipse1X, ellipse1Y, ellipse1Width, ellipse1Height;
let ellipse2X, ellipse2Y, ellipse2Width, ellipse2Height;
let triX, triY, triWidth, triHeight;
let pentX, pentY, pentRadius;

// Starting positions for reset
let rect1StartX, rect1StartY;
let rect2StartX, rect2StartY;
let ellipse1StartX, ellipse1StartY;
let ellipse2StartX, ellipse2StartY;
let triStartX, triStartY;
let pentStartX, pentStartY;

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
    handleMovement('rect1', rect1Width, rect1Height, rect1StartX, rect1StartY);
    handleMovement('rect2', rect2Width, rect2Height, rect2StartX, rect2StartY);
    handleMovement('ellipse1', ellipse1Width, ellipse1Height, ellipse1StartX, ellipse1StartY);
    handleMovement('ellipse2', ellipse2Width, ellipse2Height, ellipse2StartX, ellipse2StartY);
    handleMovement('tri', triWidth, triHeight, triStartX, triStartY);
    handleMovement('pent', pentRadius*2, pentRadius*2, pentStartX, pentStartY);

    // Draw shapes
    drawShapes();
}

function drawShapes() {
    if(darkMode){
        fill(255, 160, 160); rect(rect1X, rect1Y, rect1Width, rect1Height);
        fill(160, 255, 160); rect(rect2X, rect2Y, rect2Width, rect2Height);
        fill(160, 200, 255); ellipse(ellipse1X, ellipse1Y, ellipse1Width, ellipse1Height);
        fill(200, 160, 255); ellipse(ellipse2X, ellipse2Y, ellipse2Width, ellipse2Height);
        fill(255, 220, 100); triangle(triX, triY, triX-triWidth/2, triY+triHeight, triX+triWidth/2, triY+triHeight);
        fill(255, 180, 80); drawPentagon(pentX, pentY, pentRadius);
    } else {
        fill(255, 105, 97); rect(rect1X, rect1Y, rect1Width, rect1Height);
        fill(144, 238, 144); rect(rect2X, rect2Y, rect2Width, rect2Height);
        fill(100, 149, 237); ellipse(ellipse1X, ellipse1Y, ellipse1Width, ellipse1Height);
        fill(186, 85, 211); ellipse(ellipse2X, ellipse2Y, ellipse2Width, ellipse2Height);
        fill(255, 215, 0); triangle(triX, triY, triX-triWidth/2, triY+triHeight, triX+triWidth/2, triY+triHeight);
        fill(255, 165, 0); drawPentagon(pentX, pentY, pentRadius);
    }
}

function drawPentagon(x, y, radius){
    let angle = TWO_PI / 5;
    beginShape();
    for(let i=0;i<5;i++){
        let px = x + cos(angle*i - PI/2)*radius;
        let py = y + sin(angle*i - PI/2)*radius;
        vertex(px, py);
    }
    endShape(CLOSE);
}

function keyPressed(){
    if(key==='O'||key==='o') outlinesOn = !outlinesOn;
    if(key==='1') mode = (mode==='wrap')?'bounce':'wrap';
    if(key==='2') darkMode = !darkMode;
}

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    initScaleAndSizes();
}

function initScaleAndSizes(){
    Scale = max(1, min(width,height)/600); // ensures shapes are visible on small screens
    V = 1.5*Scale;

    rect1Width = 50*Scale; rect1Height = 60*Scale;
    rect2Width = 30*Scale; rect2Height = 30*Scale;
    ellipse1Width = 30*Scale; ellipse1Height = 30*Scale;
    ellipse2Width = 45*Scale; ellipse2Height = 45*Scale;
    triWidth = 40*Scale; triHeight = triWidth*Math.sqrt(3)/2;
    pentRadius = 25*Scale;
}

function initPositions(){
    rect1X = rect1StartX = random(0,width); rect1Y = rect1StartY = random(0,height);
    rect2X = rect2StartX = random(0,width); rect2Y = rect2StartY = random(0,height);
    ellipse1X = ellipse1StartX = random(0,width); ellipse1Y = ellipse1StartY = random(0,height);
    ellipse2X = ellipse2StartX = random(0,width); ellipse2Y = ellipse2StartY = random(0,height);
    triX = triStartX = random(0,width); triY = triStartY = random(0,height);
    pentX = pentStartX = random(0,width); pentY = pentStartY = random(0,height);
}

function initVelocities(){
    rect1VX = random(-V,V); rect1VY = random(-V,V);
    rect2VX = random(-V,V); rect2VY = random(-V,V);
    ellipse1VX = random(-V,V); ellipse1VY = random(-V,V);
    ellipse2VX = random(-V,V); ellipse2VY = random(-V,V);
    triVX = random(-V,V); triVY = random(-V,V);
    pentVX = random(-V,V); pentVY = random(-V,V);
}

function handleMovement(shape, w, h, startX, startY){
    let x, y, vx, vy;
    if(shape==='rect1'){x=rect1X;y=rect1Y;vx=rect1VX;vy=rect1VY;}
    else if(shape==='rect2'){x=rect2X;y=rect2Y;vx=rect2VX;vy=rect2VY;}
    else if(shape==='ellipse1'){x=ellipse1X;y=ellipse1Y;vx=ellipse1VX;vy=ellipse1VY;}
    else if(shape==='ellipse2'){x=ellipse2X;y=ellipse2Y;vx=ellipse2VX;vy=ellipse2VY;}
    else if(shape==='tri'){x=triX;y=triY;vx=triVX;vy=triVY;}
    else if(shape==='pent'){x=pentX;y=pentY;vx=pentVX;vy=pentVY;}

    if(mode==='wrap'){
        if(shape==='rect1'||shape==='rect2'){
            if(x > width) x = -w; if(x + w < 0) x = width;
            if(y > height) y = -h; if(y + h < 0) y = height;
        } else if(shape==='ellipse1'||shape==='ellipse2'){
            if(x-w/2>width)x=-w/2; if(x+w/2<0)x=width+w/2;
            if(y-h/2>height)y=-h/2; if(y+h/2<0)y=height+h/2;
        } else if(shape==='tri'){
            if(x-w/2>width)x=-w/2; if(x+w/2<0)x=width+w/2;
            if(y>height)y=-h; if(y+h<0)y=height;
        } else if(shape==='pent'){
            if(x-w/2>width)x=-w/2; if(x+w/2<0)x=width+w/2;
            if(y-h/2>height)y=-h/2; if(y+h/2<0)y=height+h/2;
        }
    } else {
        if(x+w>width||x<0) vx*=-1;
        if(y+h>height||y<0) vy*=-1;
        if(x>width+50||x<-50||y>height+50||y<-50){x=startX;y=startY;}
    }

    if(shape==='rect1'){rect1X=x;rect1Y=y;rect1VX=vx;rect1VY=vy;}
    else if(shape==='rect2'){rect2X=x;rect2Y=y;rect2VX=vx;rect2VY=vy;}
    else if(shape==='ellipse1'){ellipse1X=x;ellipse1Y=y;ellipse1VX=vx;ellipse1VY=vy;}
    else if(shape==='ellipse2'){ellipse2X=x;ellipse2Y=y;ellipse2VX=vx;ellipse2VY=vy;}
    else if(shape==='tri'){triX=x;triY=y;triVX=vx;triVY=vy;}
    else if(shape==='pent'){pentX=x;pentY=y;pentVX=vx;pentVY=vy;}
}
