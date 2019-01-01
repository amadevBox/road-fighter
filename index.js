const canvasWidth = Math.min(
  window.innerWidth,
  config.maxCanvasWidth,
)
const canvasHeight = window.innerHeight

const { requestAnimationFrame } = window
let prevTime = 0

const render = (game, time) => {
  const {
    ctx,
    player,
  } = game

  const speed = getSpeed(game)
  const { fps } = config

  if (time - prevTime > 1000 / fps) {
    clearCanvas(ctx)

    moveRoad(game)
    drawRoad(game)

    updateSpeed(game, speed)
    outputCurrentInfo(game)

    player.move(game)
    player.draw(ctx)

    controlEnemies(game)
    controlExplosions(game)

    checkEnemiesCollisions(game)
    prevTime = time
  }

  requestAnimationFrame((time) => render(game, time))
}

const checkEnemiesCollisions = (game) => {
  const {
    player,
    objects: { enemies = []},
  } = game

  enemies.forEach((enemy) => {
    const isCollision = checkCollisions(player, enemy, Player, Enemy)
    if (isCollision) onCarCrash(game)
  })
}


const crashAudioElm = document.getElementById('crashAudio')
const onCarCrash = (game) => {
  removeSpeedInterval(game)
  setSpeed(game, 0)
}

const clearCanvas = (ctx) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
}

window.onload = () => {
  const canvas = document.getElementById('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  const ctx = canvas.getContext('2d')

  const playerX = (canvasWidth - Player.width) / 2 - 10
  const playerY = (canvasHeight - Player.height) - 50

  const player = new Player(playerX, playerY)
  const game = {
    ctx,
    canvas: {
      width: canvasWidth,
      height: canvasHeight,
    },
    control: {
      pedals: {
        gas: false,
        brake: false,
      },
      prevPedal: 'gas',
      turn: {
        left: false,
        right: false,
      },
    },
    player,
    objects: {
      enemies: [],
      trees: [],
      explosions: [],
    },
    road: [],
    score: {
      distance: 0,
      circles: [],
    },
  }
  setSpeed(game, 20)
  addEventListener('keydown', (e) => player.moveCarByEvent.bind(player)(e, game))
  addEventListener('keyup', (e) => player.stopKeyEvent.bind(player)(e, game))
  render(game)
}
