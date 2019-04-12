let gameState = {
  score: 0,
  paused: true,
  activeObjects: [],
  draw: function() {
    buffer.background(0);
    buffer.noStroke();
    buffer.fill(255);
    for (let i = this.activeObjects.length - 1; i >= 0; i--) {
      if (typeof this.activeObjects[i] == undefined) {
        continue;
      } else {

        let coords = this.activeObjects[i].coords;

        buffer.ellipse(coords.x, coords.y, this.activeObjects[i].size);
        if (this.activeObjects[i] instanceof Projectile) {
          this.activeObjects[i].fly();
      
        }
      }
    }
  }
};

var keybinds = {
  37: () => player.move("l"),
  39: () => player.move("r"),
  32: () => player.shoot()
};

// Characters
class Character {
  constructor(x, y, v, health = 10) {
    this.coords = { x, y };
    this.speed = v;
    this.health = health;
    this.size = 50;
  }

  move(direction) {
    var directions = {
      u: () => {
        if (this.coords.y > this.speed) {
          this.coords.y -= this.speed;
        }
      },
      d: () => {
        if (this.coords.y < windowHeight - this.speed) {
          this.coords.y += this.speed;
        }
      },
      l: () => {
        if (this.coords.x > this.speed) {
          this.coords.x -= this.speed;
        }
      },
      r: () => {
        if (this.coords.x < windowWidth - this.speed) {
          this.coords.x += this.speed;
        }
      }
    };
    directions[direction]();
  }

  die() {
    let index = gameState.activeObjects.indexOf(this);
    gameState.activeObjects.splice(index, 1);
  }
}

class Player extends Character {
  constructor(x, y, v) {
    super(x, y, v);
    gameState.activeObjects.push(this);
  }
  shoot() {
    let bulat = new Projectile(this.coords.x, this.coords.y);
    bulat.speed *= -1;
  }
}

class Projectile {
  constructor(x, y) {
    this.speed = 5;
    this.size = 10;
    this.coords = { x, y };
    gameState.activeObjects.push(this);
  }
  fly() {
    this.coords.y += this.speed;
    if (this.coords.y < 0) {
      this.die();
    }
  }
  die() {
    if(gameState.activeObjects[1]){
      let index = gameState.activeObjects.indexOf(this);
      gameState.activeObjects.splice(index, 1);
    }
  }
}

class Enemy extends Character {
  constructor(v) {
    super(0, 0, v, 3);
    gameState.activeObjects.push(this);
  }
  shoot() {
    let bolet = new Projectile(this.x, this.y);
  }
}

// initialise game
var player = new Player(50, 500, 30);
