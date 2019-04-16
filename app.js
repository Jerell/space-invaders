let gameState = {
  startTime: null,
  level: -1,
  score: 0,
  unpaused: true,
  time: 0,
  activeObjects: [],
  stages: [
    // Level 0
    ( )=> {
      var play = new MainText('PLAY', 0, 0, 180)
      var instruction = new MainText('move: arrow keys | shoot: up, space', 0, 30, 180)
      var enemy = new Enemy()
      for(let i = 0; i < 6; i ++){
        var barrier = new Barrier((canvasDimensions.x - 140) / 2 + (i - 3) * 200 , Math.floor(3 * canvasDimensions.y / 4))
      }
    },
    // Level 1
    ( )=> {
      let offset = 0
      for(var i = 0; i < 10; i++){
        offset += 60 * i
        var enemy = new Enemy(5 - offset)
      }
    },
    // Level 2
    ( )=> {
      let offset = 0
      for(var i = 0; i < 25; i++){
        offset = 60 * i
        var enemy = new Enemy(5 - offset)
      }
    },
    // Level 3
    () => {
      let offset = 0
      for(var i = 0; i < 40; i++){
        offset = 60 * i
        if(i % 3 == 0){
          offset += 200
        }
        var enemy = new Enemy(5 - offset)
      }
    },
    // Level 4
    () => {
      let offset = 0
      for(var i = 0; i < 50; i++){
        if(i % 2 == 0){
          offset += 110
        }
        offset = 60 * i
        var enemy = new Enemy(5 - offset)
      }
    },
    // End
    () => {
      var end = new MainText('GAME OVER', 0, 0, 180)
    },
  ],
  levelUp: function() {
    this.level ++
    if(this.level > 0){
      this.score += 1000
      if(player.health < 4 && this.level + 1 < this.stages.length){
        var po = new PowerUp()
      }
    }
    if(this.level < this.stages.length){
      this.stages[this.level]()
    }
  },
  getHealthIndicator: function() {
    var healthMarker = '❤'
    var healthIndicator = ''
    for(let i = 0; i < player.health; i++){
      healthIndicator += healthMarker
    }
    return healthIndicator
  },
  drawAmmoIndicator: function() {
    var height = 5
    var maxWidth = 100
    var width = maxWidth * player.ammo / player.maxAmmo
    buffer.rect((canvasDimensions.x - width) / 2, 50, width, height)
  },
  draw: function() {

    if(this.activeObjects.filter(object => object instanceof Enemy || object instanceof Projectile || object instanceof MainText).length == 0 && this.level < this.stages.length - 1){
      this.levelUp()
    }

    buffer.background(0)
    buffer.noStroke()
    buffer.fill(255)
    this.drawAmmoIndicator()

    buffer.text(`Level: ${this.level} Score: ${this.score}`, canvasDimensions.x / 2, 25)
    
    buffer.fill(255, 0, 0)
    buffer.text(`${this.getHealthIndicator()}`, canvasDimensions.x / 2, 45)
    
    buffer.fill(255)
    
    for (let i = this.activeObjects.length - 1; i >= 0; i--) {
      if (typeof this.activeObjects[i] == undefined) {
        continue
      } else {
    
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
  32: () => player.shoot(),
  38: () => player.shoot(),
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
    this.shape = [0, 1, 1, 1, 0, 
                  0, 1, 1, 1, 0,
                  1, 1, 1, 1, 1,
                  1, 1, 1, 1, 1,
                  0, 1, 1, 1, 0]
    gameState.activeObjects.push(this)
  }

  draw(){
    drawObject(
      this.shape,
      this.coords.x,
      this.coords.y,
      this.size
    )
    this.hitDetection()
  }

  decay(){
    for(let i = 0; i < this.shape.length; i++){
      let threshold = 0.15
      if(this.shape[i]){
        if(Math.random() < threshold){
          this.shape[i] = 0
        }
      }
    }
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
        } else {
          this.die()
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
    this.health --
    this.decay()
    gameState.score += this.hitValue
    if (!this.health){
      this.die()
      gameState.score += 2 * this.hitValue
    }
  }

  hitDetection(){
    for (let i = gameState.activeObjects.length - 1; i >= 0; i--) {
      if (gameState.activeObjects[i] instanceof Projectile) {
        
        var x = ((this.shape.length - 1) % CHARACTER_IMAGE_COLUMNS) + 1;
        var y =
          Math.floor(
            (this.shape.length - 1) / CHARACTER_IMAGE_COLUMNS
          ) + 1;

        var bulletIsTravellingDown =
          gameState.activeObjects[i].speed >= 0;

        if (
          collideRectCircle(
            this.coords.x,
            this.coords.y,
            x * this.size,
            y * this.size,
            gameState.activeObjects[i].coords.x,
            gameState.activeObjects[i].coords.y,
            gameState.activeObjects[i].size
          )
        ) {
          console.log("collision");
          if (this instanceof Player && bulletIsTravellingDown) {
            gameState.activeObjects[i].die();
            this.takeDamage();
          } else if (
            (this instanceof Enemy && !bulletIsTravellingDown) ||
            (this instanceof PowerUp && !bulletIsTravellingDown)
          ) {
            gameState.activeObjects[i].die();
            this.takeDamage();
          }
        }
      } else if(this instanceof Player && gameState.activeObjects[i] instanceof PowerUp){
        if (
          collideRectRect(
            this.coords.x,
            this.coords.y,
            this.size * CHARACTER_IMAGE_COLUMNS,
            (this.size * this.shape.length) / CHARACTER_IMAGE_COLUMNS,
            gameState.activeObjects[i].coords.x,
            gameState.activeObjects[i].coords.y,
            gameState.activeObjects[i].size * CHARACTER_IMAGE_COLUMNS,
            (gameState.activeObjects[i].size *
              gameState.activeObjects[i].shape.length) /
              CHARACTER_IMAGE_COLUMNS
          )
        ) {
          gameState.activeObjects[i].collect();
          gameState.activeObjects[i].die();
        }
      }
    }
  }

  die() {
    if(this instanceof Player){
      gameState.unpaused = false
      // End
      var end = new MainText('GAME OVER', 0, 0, 360)
    }
    let index = gameState.activeObjects.indexOf(this)
    gameState.activeObjects.splice(index, 1)
  }
}

class Player extends Character {
  constructor(x, y, v) {
    var maxHealth = 3
    super(x, y, 10, v, maxHealth, -150)
    this.maxHealth = maxHealth
    this.shape = [0, 0, 1, 0, 0, 
                  0, 1, 1, 1, 0,
                  1, 1, 1, 1, 1,
                  1, 1, 1, 1, 1]
    this.ammo = 8
    this.maxAmmo = 10
    this.r = 255
    this.g = 255
    this.b = 255
  }
  draw(){
    buffer.fill(this.r, this.g, this.b)
    super.draw()
  }
  shoot() {
    if(this.ammo > 1 && gameState.unpaused){
      let bullet = new Bomb(this.coords.x + this.size * CHARACTER_IMAGE_COLUMNS / 2, this.coords.y - this.size * 2)
      bullet.speed *= -1.8
      this.ammo --
      gameState.score -= 3 ** gameState.level
    }
  }
  regenAmmo() {
    if(this.ammo < this.maxAmmo && gameState.unpaused){
      this.ammo += 0.04
    }
  }
  endPower(){
    this.r = 255
    this.g = 255
    this.b = 255
  }
}

class PowerUp extends Character {
  constructor(){
    var colPositions = [
      185,
      385,
      585,
      785
    ]
    var xPos = colPositions[Math.floor(Math.random() * colPositions.length)]
    super(xPos, 70, 5, 2, 1, 100)
    this.shape = [0, 1, 1, 1, 0, 
                  0, 1, 1, 1, 0,
                  1, 1, 1, 1, 1,
                  1, 1, 1, 1, 1,
                  0, 1, 1, 1, 0]
    this.r = Math.random() * 255
    this.g = Math.random() * 255
    this.b = Math.random() * 255
  }
  draw(){
    buffer.fill(this.r, this.g, this.b)
    super.draw()
    this.move('d')
  }
  collect(){
    player.r = this.r
    player.g = this.g
    player.b = this.b
    player.health ++
  }
}

class Projectile {
  constructor(x, y, s = 10) {
    this.speed = 5
    this.size = s
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

class Bomb extends Projectile {
  constructor(x, y, s){
    super(x, y, s)
    this.collisionTime = null
  }
  explode() {
    this.size = (gameState.time - this.collisionTime) * 0.5
    console.log(this.size)
  }
  die(){
    if(!this.collisionTime) this.collisionTime = gameState.time
    this.speed = 0
    this.explode()
  }
  draw(){
    super.draw()
    if(this.collisionTime && gameState.time - this.collisionTime > 500){
      super.die()
    }
  }
}

class Enemy extends Character {
  constructor(x = 5,y = 70,v = 3, s = 5, h = 1,val = 100) {
    super(x, y, s, v, h, val)
    this.hasEnteredScreen = false
    this.shape1 = [0, 1, 1, 1, 0, 
                  1, 1, 1, 1, 1,
                  1, 0, 1, 0, 1,
                  0, 1, 0, 1, 0,
                  1, 0, 1, 0, 1,
                  1, 0, 0, 0, 1]
    this.shape2 = [0, 1, 1, 1, 0, 
                  1, 1, 1, 1, 1,
                  1, 0, 1, 0, 1,
                  0, 1, 0, 1, 0,
                  1, 0, 0, 0, 1,
                  0, 1, 0, 1, 0]
    this.shape = this.shape1
  }
  draw(){
    buffer.fill(255)
    super.draw()
  }
  getDistanceMultiplier(){
    var dist = Math.abs(player.coords.x - this.coords.x)
    var fractionOfMax = 2 * dist / canvasDimensions.x
    return (1 - fractionOfMax) * 5
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
    if(Math.floor(gameState.time) % 1000 > 500){
      this.shape = this.shape2 
    } else{
      this.shape = this.shape1
    }

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
    if(gameState.unpaused && Math.random() < 0.002 * this.getDistanceMultiplier()){
      this.shoot()
    }
  }
}


// Game objects
class BarrierBlock {
  constructor(x, y, s = 5, health = 10) {
    this.coords = { x, y };
    this.maxHealth = health;
    this.health = health;
    this.size = s;
    gameState.activeObjects.push(this);
  }

  draw() {
    buffer.fill((255 * this.health) / this.maxHealth);
    buffer.rect(this.coords.x, this.coords.y, this.size, this.size);
    buffer.fill(255);
    this.hitDetection();
  }

  takeDamage(amount = 1) {
    this.health -= amount;
    if (this.health < 1) {
      this.die();
    }
  }

  die() {
    if (this instanceof Player) {
      gameState.unpaused = false;
    }
    let index = gameState.activeObjects.indexOf(this);
    gameState.activeObjects.splice(index, 1);
  }

  hitDetection() {
    buffer.ellipseMode(CORNER)
    for (let i = gameState.activeObjects.length - 1; i >= 0; i--) {
      if (
        gameState.activeObjects[i] instanceof Projectile ||
        gameState.activeObjects[i] instanceof Enemy
      ) {
        if (gameState.activeObjects[i] instanceof Projectile) {
          if (
            collideRectCircle(
              this.coords.x,
              this.coords.y,
              this.size,
              this.size,
              gameState.activeObjects[i].coords.x,
              gameState.activeObjects[i].coords.y,
              gameState.activeObjects[i].size,
            )
          ) {
            if (gameState.activeObjects[i] instanceof Projectile) {
              this.takeDamage(gameState.activeObjects[i].speed < 0 ? 2 : 1);
              if (gameState.activeObjects[i]) {
                // I shouldn't need this but it was somehow becoming undefined
                gameState.activeObjects[i].die();
              }
            }
          }
        } else if (gameState.activeObjects[i] instanceof Enemy) {
          if (
            collideRectRect(
              this.coords.x,
              this.coords.y,
              this.size,
              this.size,
              gameState.activeObjects[i].coords.x,
              gameState.activeObjects[i].coords.y,
              gameState.activeObjects[i].size * CHARACTER_IMAGE_COLUMNS,
              (gameState.activeObjects[i].size *
                gameState.activeObjects[i].shape.length) /
                CHARACTER_IMAGE_COLUMNS
            )
          ) {
            this.die();
          }
        }
      }
    }
    buffer.ellipseMode(CENTER)
  }
}

class Barrier {
  constructor(x, y, s = 20, cols = 7){
    this.coords = {x, y}
    this.columns = cols
    this.size = s
    this.shape = [0, 0, 1, 1, 1, 0, 0,
                  0, 1, 1, 1, 1, 1, 0,
                  1, 1, 1, 0, 1, 1, 1,
                  1, 1, 0, 0, 0, 1, 1]
    for(var i = 0; i < this.shape.length; i++){
      var x = i % cols
      var y = Math.floor(i / cols)
      if(this.shape[i]){
        var block = new BarrierBlock(x * this.size + this.coords.x, y * this.size + this.coords.y, this.size, this.size)
      }
    }
  }
}

class MainText {
  constructor(text, xOffset = 0, yOffset = 0, additionalFrames = 0){
    this.text = text
    this.xOffset = xOffset
    this.yOffset = yOffset
    this.displayFrames = 120 + additionalFrames
    gameState.activeObjects.push(this)
  }

  draw(){
    buffer.fill(255)
    buffer.text(this.text, canvasDimensions.x / 2 + this.xOffset, canvasDimensions.y / 2 + this.yOffset)
    if(gameState.unpaused){
      this.fade()
    }
  }
  
  die() {
    let index = gameState.activeObjects.indexOf(this)
    gameState.activeObjects.splice(index, 1)
  }

  fade() {
    this.displayFrames --
    if(this.displayFrames < 1){
      this.die()
    }
  }
}

// initialise game
var player = new Player(canvasDimensions.x / 2 - 25, canvasDimensions.y - 50, 5);

var timeCount = function(timestamp) {
  if (!gameState.startTime) gameState.startTime = timestamp
  gameState.time = Math.floor(timestamp - gameState.startTime)
  requestAnimationFrame(timeCount)
}

requestAnimationFrame(timeCount)