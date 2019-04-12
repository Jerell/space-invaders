let gameState = {
  score: 0,
  unpaused: true,
  activeObjects: [],
  draw: function() {
    buffer.background(0)
    buffer.noStroke()
    buffer.fill(255)
    buffer.text(`Score: ${this.score}`, canvasDimensions.x / 2, 20)
    for (let i = this.activeObjects.length - 1; i >= 0; i--) {
      if (typeof this.activeObjects[i] == undefined) {
        continue
      } else {
        this.activeObjects[i].draw()
        if (this.activeObjects[i] instanceof Enemy) {
          this.activeObjects[i].march()
          this.activeObjects[i].hitDetection()
        } else if (this.activeObjects[i] instanceof Player) {
          this.activeObjects[i].regenAmmo()
          this.activeObjects[i].hitDetection()
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
  32: () => player.shoot(),
  80: () => {gameState.unpaused = !gameState.unpaused;}
}

// Characters
class Character {
  constructor(x, y, s, v, health = 1, val = 0) {
    this.coords = { x, y }
    this.speed = v
    this.health = health
    this.size = s
    this.hitValue = val
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
    var currentSpeed = gameState.unpaused ? this.speed : 0;
    var directions = {
      u: () => {
        if (this.coords.y > currentSpeed) {
          this.coords.y -= currentSpeed
        }
      },
      d: () => {
        if (this.coords.y < canvasDimensions.y - currentSpeed) {
          this.coords.y += currentSpeed
        }
      },
      l: () => {
        if (this.coords.x > currentSpeed) {
          this.coords.x -= currentSpeed
        }
      },
      r: () => {
        if (this.coords.x < (canvasDimensions.x - currentSpeed - this.size * CHARACTER_IMAGE_COLUMNS)) {
          this.coords.x += currentSpeed
        }
      }
    }
    directions[direction]()
  }

  takeDamage(){
    buffer.fill(255, 0, 0)
    this.health --
    gameState.score += this.hitValue
    if (!this.health){
      this.die()
      gameState.score += 2 * this.hitValue
    }
  }

  hitDetection(){
    for (let i = gameState.activeObjects.length - 1; i >= 0; i--) {
      if (gameState.activeObjects[i] instanceof Projectile) {
        
        var x = (this.shape.length - 1) % CHARACTER_IMAGE_COLUMNS + 1;
        var y = Math.floor((this.shape.length - 1) / CHARACTER_IMAGE_COLUMNS) + 1;
        
        var bulletIsTravellingDown = gameState.activeObjects[i].speed >= 0;

        if (collidePointRect(gameState.activeObjects[i].coords.x,
                             gameState.activeObjects[i].coords.y,
                             this.coords.x,
                             this.coords.y,
                             x * this.size,
                             y * this.size
                            )) {
          if (this instanceof Player && bulletIsTravellingDown) {
            gameState.activeObjects[i].die()
            this.takeDamage();
          } else if(this instanceof Enemy && !bulletIsTravellingDown){
            gameState.activeObjects[i].die()
            this.takeDamage();
          }
        }
      }
    } 
  }

  die() {
    if(this instanceof Player){
      gameState.unpaused = false
    }
    let index = gameState.activeObjects.indexOf(this)
    gameState.activeObjects.splice(index, 1)
  }
}

class Player extends Character {
  constructor(x, y, v) {
    super(x, y, 10, v, 3, -150)
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
      let bullet = new Projectile(this.coords.x + this.size * CHARACTER_IMAGE_COLUMNS / 2, this.coords.y - this.size * 2)
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
    var currentSpeed = gameState.unpaused ? this.speed : 0;
    this.coords.y += currentSpeed
    if (this.coords.y < 0 || this.coords.y > canvasDimensions.y) {
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
  constructor(x = 5,
              y = 35,
              v = 2, 
              s = 5, 
              h = 1,
              val = 100
              ) {
    super(x, y, s, v, h, val)
    this.hasEnteredScreen = false
    this.shape = [0, 1, 1, 1, 0, 
                  1, 1, 1, 1, 1,
                  1, 0, 1, 0, 1,
                  0, 1, 0, 1, 0,
                  1, 0, 1, 0, 1,
                  1, 0, 0, 0, 1]
    gameState.activeObjects.push(this)
  }
  shoot() {
    if(!this.hasEnteredScreen){
      return
    }
    var imageRows = Math.floor((this.shape.length - 1) / CHARACTER_IMAGE_COLUMNS) + 1
    let bullet = new Projectile(this.coords.x + this.size * CHARACTER_IMAGE_COLUMNS / 2, this.coords.y + this.size * imageRows)
  }
  isTouchingLeftWall(){
    return this.coords.x <= 0
  }
  isTouchingRightWall(){
    return this.coords.x + this.size * 6 >= canvasDimensions.x
  }
  march(){
    if(!this.hasEnteredScreen){
      if(this.coords.x > 0){
        this.hasEnteredScreen = true
      }
    }
    if(this.isTouchingRightWall() || this.isTouchingLeftWall() && this.hasEnteredScreen){
      this.coords.y += this.size * 8
      this.speed *= -1
    }
    this.move('r')
    if(gameState.unpaused && Math.random() < 0.01){
      this.shoot()
    }
  }
}

// initialise game
var player = new Player(50, canvasDimensions.y - 50, 5)
function newWave(){
  if(gameState.score){
    gameState.score += 100
  }
  if(gameState.unpaused){
    for(var i = 0; i < 40; i++){
      var enemy = new Enemy(5 - 60 * i)
    }
  }
}

newWave()