// const UDLR_CODES = [38, 40, 37, 39, 32]
const UDLR_CODES = [37, 39, 32]

var canvasDimensions = {
  x: 1000,
  y: 600
}

// initialises canvas
function setup() {
  createCanvas(canvasDimensions.x, canvasDimensions.y);
  background(0);
  buffer = createGraphics(canvasDimensions.x, canvasDimensions.y);
  buffer.background(0, 0, 0, 0);
}

function tryKeyPress(key) {
  try {
    keybinds[key]();
  } catch (error) {
    throw error
  }
}

function drawObject(obj, xOffset = 0, yOffset = 0, size = 10){
  var columns = 5;
  for(var i = 0; i < obj.length; i++){
    var x = i % columns
    var y = Math.floor(i / columns)
    if(obj[i]){
      buffer.rect(x * size + xOffset, y * size + yOffset, size, size)
    }
  }
}


//draw function
function draw() {
  image(buffer, 0, 0);

  if(keyIsPressed){
    if(keyIsDown(keyCode)){
      if(UDLR_CODES.indexOf(keyCode) > -1){
        tryKeyPress(keyCode);
      }
    }

  }
  gameState.draw();
}
