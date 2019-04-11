let gameState = {
  score: 0,
  paused: true,
  activeObjects: [],
  draw: function(){
    buffer.background(0);
    buffer.noStroke();
    buffer.fill(255);
    for(let i = 0; i < this.activeObjects.length; i++){
      let coords = this.activeObjects[i].coords;
      buffer.ellipse(coords.x, coords.y, 50);
    }
  },
}

var keybinds = {
  37: () => player.move("l"),
  39: () => player.move("r"),
  32: () => player.shoot()
};


// Characters
class Character {
  constructor(x, y, v, health = 10, ) {
    this.coords = { x, y };
    this.speed = v;
    this.health = health;
  }
  move(direction){
    var directions = {
      u: ()=>(this.coords.y -= this.speed),
      d: ()=>(this.coords.y += this.speed),
      l: ()=>(this.coords.x -= this.speed),
      r: ()=>(this.coords.x += this.speed),
    }
    directions[direction]();
  }
  die(){
    index = gameState.activeObjects.indexOf(this);
    gameState.activeObjects.splice(index);
  }
}

class Player extends Character {
  constructor(x, y, v) {
    super(x, y, v);
    gameState.activeObjects.push(this);
  }
  shoot(){
    let bulat = new Projectile(this.x, this.y);
    bulat.speed -=1;
  }
}

class Projectile {
  constructor (x, y) {
    this.speed = 1;
    this.coords ={x, y};
    gameState.activeObjects.push(this);
  }
}

class Enemy extends Character {
  constructor(v) {
    super(0, 0, v, 3);
    gameState.activeObjects.push(this);
  }
  shoot(){
    let bolet = new Projectile(this.x, this.y);
  }
}




// initialise game
var player = new Player(50, 200, 30);