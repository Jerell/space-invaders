let gameState = {
  score: 0,
  paused: true,
  activeObjects: []
}

// Characters
class Character {
  constructor(x, y, v, health = 10, ) {
    this.coords = { x, y };
    this.speed = v;
    this.health = health;
  }
}

class Player extends Character {
  constructor(x, y, v) {
    super(x, y, v);
    gameState.activeObjects.push(this);
  }
}

class Enemy extends Character {
  constructor(v) {
    super(0, 0, v, 3);
    gameState.activeObjects.push(this);
  }
  shoot(){
    let bullet = new Projectile(this.x, this.y);
    gameState.activeObjects.push(bullet);
  }
}

class Projectile {
  constructor (x, y) {
    this.speed = 1;
    this.x = x;
    this.y = y;
  }
}

let enemy1 = new Enemy(5)