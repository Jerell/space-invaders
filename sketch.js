// initialises canvas
function setup() {
  createCanvas(document.body.clientWidth, windowHeight);
  background(0);
  buffer = createGraphics(document.body.clientWidth, windowHeight);
  buffer.background(0, 0, 0, 0);
}

function tryKeyPress(key) {
  try {
    if (keyIsDown(key)) {
      keybinds[key]();
    }
  } catch (error) {
    console.log(`${key} doesn't do anything`);
  }
}

function keyPressed() {
  tryKeyPress(keyCode);
}

//draw function
function draw() {
  image(buffer, 0, 0);
  gameState.draw();

  // if (keyIsPressed) {
  //   try {
  //     keybinds[key]();
  //   } catch (error) {
  //     console.log(`${key} doesn't do anything`);
  //   }
  // }
}
