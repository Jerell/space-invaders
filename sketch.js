const KEYS = [37, 39, 32, 38, 80]
const CHARACTER_IMAGE_COLUMNS = 5;

var canvasDimensions = {
  x: 1000,
  y: innerHeight
}

// initialises canvas
function setup() {
  createCanvas(canvasDimensions.x, canvasDimensions.y);
  buffer = createGraphics(canvasDimensions.x, canvasDimensions.y);
  buffer.background(0)
  buffer.textSize(20)
  buffer.textAlign(CENTER)
}

function tryKeyPress(key) {
  try {
    keybinds[key]();
  } catch (error) {
    throw error
  }
}

function drawObject(obj, xOffset = 0, yOffset = 0, size = 10){
  for(var i = 0; i < obj.length; i++){
    var x = i % CHARACTER_IMAGE_COLUMNS
    var y = Math.floor(i / CHARACTER_IMAGE_COLUMNS)
    if(obj[i]){
      buffer.rect(x * size + xOffset, y * size + yOffset, size, size)
    }
  }
}

function keyPressed() {
  if (keyCode === 80) {
    keybinds[80]();
  }
}

//draw function
function draw() {
  image(buffer, 0, 0);

  if(keyIsPressed){
    if(keyIsDown(keyCode)){
      if(KEYS.indexOf(keyCode) > -1){
        tryKeyPress(keyCode);
      }
    }

  }
  gameState.draw();
}
