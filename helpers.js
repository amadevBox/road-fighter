const checkCollisions = (
  obj1,
  obj2,
  obj1Props,
  obj2Props,
  obj1Border = 10,
  obj2Border = 10,
) => {
  if (
    (
      (
        (obj1.x + obj1Border <= obj2.x + obj2Props.width - obj2Border) &&
        (obj1.x + obj1Border >= obj2.x + obj2Border)
      ) ||
      (
        (obj1.x + obj1Props.width - obj1Border >= obj2.x + obj2Border) &&
        (obj1.x + obj1Props.width - obj1Border <= obj2.x + obj2Props.width - obj2Border)
      )
    ) &&
    (
      (obj1.y <= obj2.y + obj2Props.height) && (obj1.y > obj2.y) ||
      (obj1.y <= obj2.y) && (obj1.y + obj1Props.height > obj2.y)
    )
  ) {
    return true
  }
  return false
}

const getRoadsideWidth = (game) => {
  const { canvas: { width: canvasWidth }} = game
  const roadWidth = getRoadWidth()

  const roadsideWidth = (canvasWidth - roadWidth) / 2
  return roadsideWidth
}

const getCanvasProps = (game) => {
  const { canvas } = game
  return canvas
}

// objects generation
const enemyImg = document.getElementById('img-enemy').src
const { maxEnemiesNumber, probabilityOfEnemyCreation } = config
const controlEnemies = (game) => {
  const {
    ctx,
    objects: {
      enemies,
      explosions,
    },
  } = game

  if (enemies.length < maxEnemiesNumber) {
    const shouldGenerateNew = Math.random() < probabilityOfEnemyCreation
    if (shouldGenerateNew) {
      const enemy = new Enemy(game, enemyImg)
      enemies.push(enemy)
    }
  }

  enemies.forEach((enemy, idx) => {
    enemy.move(game)
    const isAlive = enemy.validation(game)
    if (isAlive) {
      enemy.draw(ctx)
    } else {
      const removedEnemy = enemies.splice(idx, 1)[0]
      if (!removedEnemy.drawn) return
      const explosion = new Explosion(removedEnemy.x, removedEnemy.y)
      const isExplosionAlive = explosion.validation(game)
      if (isExplosionAlive) {
        explosions.push(explosion)
      }
    }
  })
}

// trees
const { maxTreesNumber, probabilityOfTreeCreation } = config
const controlTrees = (game) => {
  const { objects: { trees }, ctx } = game
  if (trees.length < maxTreesNumber) {
    const shouldGenerateNew = Math.random() < probabilityOfTreeCreation
    if (shouldGenerateNew) {
      const tree = new Tree(game)
      trees.push(tree)
    }
  }

  trees.forEach((tree, idx) => {
    tree.draw(ctx)
  })
}

// explosions
const controlExplosions = (game) => {
  const { objects: { explosions }, ctx } = game

  explosions.forEach((explosion, idx) => {
    explosion.move(game)
    const isAlive = explosion.validation(game)
    if (isAlive) {
      explosion.draw(ctx)
    } else {
      explosions.splice(idx, 1)
    }
  })
}


// speed controller
const acceleration = 10

const MAX_SPEED = 100
const MIN_SPEED = 0

const setSpeed = (game, newSpeed) => {
  if (!game || !game.control) return
  game.control.speed = newSpeed
}

const getSpeed = (game) => {
  if (!game || !game.control) return
  const { control : { speed }} = game
  return speed
}

const removeSpeedInterval = (game) => {
  game.control.removeInterval = true
}

const updateSpeed = (game, newSpeed) => {
  const initialActivePedal = getActiveControlType(game, 'pedals')
  const { control: { prevPedal, removeInterval } } = game
  if ((initialActivePedal === prevPedal) && !removeInterval) return

  const currentSpeed = getSpeed(game)
  let timeFrom = 0
  const intervalPeriod = 50

  const interval = setInterval(() => {
    const activePedal = getActiveControlType(game, 'pedals')

    let newSpeed
    if (initialActivePedal === 'gas') {
      newSpeed = currentSpeed + timeFrom * acceleration
    } else if (initialActivePedal === 'brake') {
      newSpeed = currentSpeed - timeFrom * (acceleration * 5)
    } else {
      newSpeed = currentSpeed - timeFrom * (acceleration / 2)
    }

    setSpeed(game, newSpeed)

    timeFrom += (intervalPeriod / 1000)

    if (activePedal !== initialActivePedal || game.control.removeInterval) {
      customClearInterval(game, interval)
    }

    if (initialActivePedal === 'gas') {
      if (newSpeed >= MAX_SPEED) {
        setSpeed(game, MAX_SPEED)
        customClearInterval(game, interval)
      }
    } else {
      if (newSpeed <= MIN_SPEED) {
        setSpeed(game, MIN_SPEED)
        customClearInterval(game, interval)
      }
    }
  }, intervalPeriod)
  game.control.prevPedal = initialActivePedal
}

const customClearInterval = (game, interval) => {
  clearInterval(interval)
  game.control.removeInterval = false
}

const activatePedal = (game, pedalType) => {
  if (!game || !game.control) return
  const pedalState = getPedalState(game, pedalType)
  if (pedalState) return
  // reset all pedals to false
  Object.keys(game.control.pedals)
    .forEach((key) => resetPedal(game, key))
  game.control.pedals[pedalType] = true
}

const activateTurn = (game, turnType) => {
  if (!game || !game.control) return
  const turnState = getTurnState(game, turnType)
  if (turnState) return
  // reset all pedals to false
  Object.keys(game.control.turn)
    .forEach((key) => resetTurn(game, key))
  game.control.turn[turnType] = true
}

// reset pedals or turn
const resetControlType = (game, controlType, key) => {
  if (
    !game ||
    !game.control ||
    !game.control[controlType]
  ) return
  game.control[controlType][key] = false
}

const resetPedal = (game, key) => {
  resetControlType(game, 'pedals', key)
}

const resetTurn = (game, key) => {
  resetControlType(game, 'turn', key)
}

// get active pedals or turn
const getActiveControlType = (game, controlType) => {
  const active = Object.keys(game.control[controlType])
    .find((key) => {
      return game.control[controlType][key]
    })
  return active
}

const getActiveTurn = (game) => getActiveControlType(game, 'turn')

const getPedalState = (game, pedalType) => {
  return game.control.pedals[pedalType]
}

const getTurnState = (game, turnType) => {
  return game.control.turn[turnType]
}


// output helper
const speedEl = document.getElementById('speed')
const outputCurrentInfo = (game) => {
  const speed = getSpeed(game)
  speedEl.innerHTML = Number(speed).toFixed(1)
}
