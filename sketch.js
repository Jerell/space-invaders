const UDLR_CODES = [38, 40, 37, 39, 32]
// initialises canvas
function setup() {
  createCanvas(document.body.clientWidth, windowHeight);
  background(0);
  buffer = createGraphics(document.body.clientWidth, windowHeight);
  buffer.background(0, 0, 0, 0);
}

function tryKeyPress(key) {
  try {
    keybinds[key]();
  } catch (error) {
    throw error
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
