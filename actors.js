class Car {
  constructor(x = 0, y = 0, imgSrc) {
    this.x = x
    this.y = y
    this.image = new Image()
    this.image.src = imgSrc
  }

  draw(ctx) {
    const { x, y } = this
    ctx.drawImage(this.image, x, y, Car.width, Car.height)
    this.drawn = true
  }
}
Car.height = 160
Car.width = 80


class Enemy extends Car {
  constructor(game, imgSrc) {
    const { canvas: { width: canvasWidth }} = game
    const roadWidth = getRoadWidth()
    const roadsideWidth = (canvasWidth - roadWidth) / 2

    const randomVar = Math.random()

    const x = (randomVar * (roadWidth - Enemy.width)) + roadsideWidth
    const y = -Enemy.height

    super(x, y, imgSrc)

    const [minSpeed, maxSpeed] =  [10, 100]

    this.speed = (randomVar * (maxSpeed - minSpeed)) + minSpeed
    this.direction = randomVar < 0.33
      ? 'left'
      : randomVar > 0.66
        ? 'right'
        : null
    this.numberOfValidtions = 0
    this.rotationDirection = null
  }

  move(game) {
    const speed = getSpeed(game)
    this.y = this.y + (speed - this.speed)

    const shift = this.speed * 0.05

    const roadWidth = getRoadWidth()
    const roadsideWidth = getRoadsideWidth(game)

    if (this.direction === 'left') {
      this.x -= shift
      if (this.x < roadsideWidth) {
        this.direction = 'right'
      }
    } else if (this.direction === 'right') {
      this.x += shift
      if (this.x > roadsideWidth + roadWidth - Enemy.width) {
        this.direction = 'left'
      }
    }
  }

  validation(game) {
    this.numberOfValidtions++
    // make validation on each 5th iteration
    if (this.numberOfValidtions < 5) return true
    else this.numberOfValidtions = 0

    const { y } = this
    const { height: canvasHeight } = getCanvasProps(game)

    if (
      (y + Enemy.height < -canvasHeight) ||
      (y > canvasHeight)
    ) return false

    const {
      objects: { enemies = [] },
    } = game

    // check collisions with another enemies
    return enemies.every((enemy) => {
      if (enemy === this) return true
      const isCollision = checkCollisions(this, enemy, Enemy, Enemy)
      if (isCollision) return false
      return true
    })

    return true
  }
}
Enemy.height = 160
Enemy.width = 80


const playerImg = document.getElementById('img-player')
class Player extends Car {
  constructor(x = 300, y = 400) {
    super(x, y)
    this.rotationDirection = null
  }

  draw(ctx) {
    const { x, y, rotationDirection } = this
    const {
      width: pWidth,
      height: pHeight,
      rotationDeg,
    } = Player

    if (rotationDirection) {
      ctx.save()
      const deg = rotationDirection === 'right' ? rotationDeg : -rotationDeg

      var rad = deg * Math.PI / 180

      // Set the origin to the center of the image
      ctx.translate(x + pWidth / 2, y + pHeight / 5)

      // Rotate the canvas around the origin
      ctx.rotate(rad)
      ctx.drawImage(Player.image, pWidth / 2 * (-1), pHeight / 5 * (-1), pWidth, pHeight)

      ctx.restore()
    } else {
      ctx.drawImage(Player.image, x, y, Player.width, Player.height)
    }
  }

  move(game) {
    const speed = getSpeed(game)
    const turn = getActiveTurn(game)

    const roadWidth = getRoadWidth()
    const roadsideWidth = getRoadsideWidth(game)

    if (turn === 'left' && this.x > roadsideWidth) {
      this.x -= 0.4 * speed
    } else if (turn === 'right' && this.x < roadsideWidth + roadWidth - Player.width) {
      this.x += 0.4 * speed
    }
  }

  moveCarByEvent(e, game) {
    switch(e.key) {
      case 'ArrowLeft': {
        activateTurn(game, 'left')
        this.rotationDirection = 'left'
        break
      }
      case 'ArrowRight': {
        activateTurn(game, 'right')
        this.rotationDirection = 'right'
        break
      }
      case 'ArrowDown': {
        activatePedal(game, 'brake')
        break
      }
      case 'ArrowUp': {
        activatePedal(game, 'gas')
        break
      }
    }
  }

  stopKeyEvent(e, game) {
    switch(e.key) {
      case 'ArrowLeft': {
        this.stopTurning()
        resetTurn(game, 'left')
        break
      }
      case 'ArrowRight': {
        this.stopTurning()
        resetTurn(game, 'right')
        break
      }
      case 'ArrowDown': {
        resetPedal(game, 'brake')
        break
      }
      case 'ArrowUp': {
        resetPedal(game, 'gas')
        break
      }
    }
  }

  stopTurning() {
    this.rotationDirection = null
  }
}

Player.height = 160
Player.width = 80
Player.rotationDeg = 10
Player.image = playerImg


const explosprite = document.getElementById('img-explosprite')
const FRAME_SIZE = 128

class Explosion {
  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y

    this.image = new Image()
    this.image.src = explosprite.src

    this.currentFrame = 0
  }

  move(game) {
    const speed = getSpeed(game)
    const { y } = this
    this.y += speed
  }

  draw(ctx) {
    if (this.currentFrame > 15) return

    const { x, y } = this
    const dx = (this.currentFrame % 4) * FRAME_SIZE
    const dy = Math.floor(this.currentFrame / 4) * FRAME_SIZE

    ctx.drawImage(
      this.image,
      dx, dy,
      Explosion.width, Explosion.height,
      x, y,
      FRAME_SIZE, FRAME_SIZE
    )

    this.currentFrame++
  }

  validation(game) {
    const { y } = this
    const { height: canvasHeight } = getCanvasProps(game)
    if ((y < -Explosion.height) || (y > canvasHeight)) return false
    if (this.currentFrame > 15) return false
    return true
  }
}
Explosion.height = FRAME_SIZE
Explosion.width = FRAME_SIZE
