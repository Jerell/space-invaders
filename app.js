let gameState = {
  score: 0,
  paused: true,
  activeObjects: [],
  draw: function() {
    buffer.background(0)
    buffer.noStroke()
    buffer.fill(255)
    for (let i = this.activeObjects.length - 1; i >= 0; i--) {
      if (typeof this.activeObjects[i] == undefined) {
        continue
      } else {
        let coords = this.activeObjects[i].coords


        this.activeObjects[i].draw()
        if (this.activeObjects[i] instanceof Enemy) {
          this.activeObjects[i].march()
        } else if (this.activeObjects[i] instanceof Player) {
          this.activeObjects[i].regenAmmo()
        } else {
          if (this.activeObjects[i] instanceof Projectile) {
            this.activeObjects[i].fly()
          }
        }
      }
    }
  }
}

var keybinds = {
  37: () => player.move("l"),
  39: () => player.move("r"),
  32: () => player.shoot()
}

// Characters
class Character {
  constructor(x, y, s, v, health = 1) {
    this.coords = { x, y }
    this.speed = v
    this.health = health
    this.size = s
  }

  draw(){
    drawObject(
      this.shape,
      this.coords.x,
      this.coords.y,
      this.size
    )
  }

  move(direction) {
    var directions = {
      u: () => {
        if (this.coords.y > this.speed) {
          this.coords.y -= this.speed
        }
      },
      d: () => {
        if (this.coords.y < windowHeight - this.speed) {
          this.coords.y += this.speed
        }
      },
      l: () => {
        if (this.coords.x > this.speed) {
          this.coords.x -= this.speed
        }
      },
      r: () => {
        if (this.coords.x < windowWidth - this.speed) {
          this.coords.x += this.speed
        }
      }
    }
    directions[direction]()
  }

  die() {
    let index = gameState.activeObjects.indexOf(this)
    gameState.activeObjects.splice(index, 1)
  }
}

class Player extends Character {
  constructor(x, y, v) {
    super(x, y, 5, v, 3)
    this.shape = [0, 0, 1, 0, 0, 
                  0, 1, 1, 1, 0,
                  1, 1, 1, 1, 1,
                  1, 1, 1, 1, 1]
    this.ammo = 5
    this.maxAmmo = 5
    gameState.activeObjects.push(this)
  }
  shoot() {
    if(this.ammo > 1){
      let bullet = new Projectile(this.coords.x + this.size * 2.5, this.coords.y - this.size * 2)
      bullet.speed *= -1
      this.ammo --
    }
  }
  regenAmmo() {
    if(this.ammo < this.maxAmmo){
      this.ammo += 0.05
    }
  }
}

class Projectile {
  constructor(x, y) {
    this.speed = 5
    this.size = 10
    this.coords = { x, y }
    gameState.activeObjects.push(this)
  }

  fly(){
    this.coords.y += this.speed
    if (this.coords.y < 0) {
      this.die()
    }
  }

  draw() {
    buffer.ellipse(this.coords.x, this.coords.y, this.size)
  }
  die() {
    if(gameState.activeObjects[1]){
      let index = gameState.activeObjects.indexOf(this)
      gameState.activeObjects.splice(index, 1)
    }
  }
}

class Enemy extends Character {
  constructor(v, s = 5) {
    super(5, 5, s, v, 3)
    this.shape = [0, 1, 1, 1, 0, 
                  1, 1, 1, 1, 1,
                  1, 0, 1, 0, 1,
                  0, 1, 0, 1, 0,
                  1, 0, 1, 0, 1,
                  1, 0, 0, 0, 1]
    gameState.activeObjects.push(this)
  }
  shoot() {
    let bullet = new Projectile(this.coords.x + this.size / 2, this.coords.y + this.size * 1.2)
  }
  isTouchingLeftWall(){
    return this.coords.x <= 0
  }
  isTouchingRightWall(){
    return this.coords.x + this.size * 6 >= canvasDimensions.x
  }
  march(){
    if(this.isTouchingRightWall() || this.isTouchingLeftWall()){
      var newSpeed = -this.speed
      this.speed = 0
      this.coords.y += this.size * 8
      this.speed = newSpeed
    }
    this.move('r')
    if(Math.random() < 0.01){
      this.shoot()
    }
  }
}

// initialise game
var player = new Player(50, canvasDimensions.y - 50, 5)

for(var i = 0; i < 20; i++){
  setTimeout(() => {
    var enemy = new Enemy(2)
  }, 500 * i)
}