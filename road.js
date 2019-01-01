const roadWidth = 400

const roadImg = document.getElementById('img-road')
class RoadPart {
  constructor(game, x, y) {
    const {
      canvas: {
        width: canvasWidth,
        height: canvasHeight,
      },
    } = game

    const roadX = (x !== undefined) ? x : (canvasWidth - roadWidth) / 2
    const roadY = (y !== undefined) ? y : 0

    this.x = roadX
    this.y = roadY
    this.roadHeight = canvasHeight
  }

  draw(ctx) {
    ctx.drawImage(
      roadImg,
      0, 0,
      400, 400,
      this.x, this.y,
      roadWidth, this.roadHeight
    )
  }

  move(game) {
    const speed = getSpeed(game)
    this.y += speed

    if (this.y >= this.roadHeight) {
      const anotherPart = getNeighborPart(game, this)
      this.y = anotherPart.y - this.roadHeight + speed
    }
  }
}

const getNeighborPart = (game, somePart) => {
  const { road } = game
  return road.find((part) => part !== somePart)
}

const drawRoad = (game) => {
  const {
    ctx,
    canvas: {
      height: canvasHeight,
    },
    road,
  } = game
  if (!road.length) {
    const roadPart1 = new RoadPart(game)
    const roadPart2 = new RoadPart(game, undefined, canvasHeight)

    road.push(roadPart1, roadPart2)
  }

  const roadsideWidth = getRoadsideWidth(game)
  const roadWidth = getRoadWidth()

  ctx.fillStyle = '#494948'
  ctx.fillRect(
    roadsideWidth, 0,
    roadWidth, 100
  )

  road.forEach((part) => {
    part.draw(ctx)
  })

  controlTrees(game)
}


const getRoadWidth = () => {
  return roadWidth
}

const moveRoad = (game) => {
  if (!game.road) return
  const {
    road = [],
    objects: { trees = [] },
  } = game

  road.forEach((part) => {
    part.move(game)
  })

  trees.forEach((tree) => {
    tree.move(game)
  })
}


const treeImg = document.getElementById('img-tree')
class Tree {
  constructor(game) {
    const { canvas: { width: canvasWidth }} = game
    const roadWidth = getRoadWidth()

    const roadsideWidth = (canvasWidth - roadWidth) / 2
    const side = Math.random() > 0.5 ? 'rigth' : 'left'

    const x = Math.random() * (roadsideWidth - Tree.width)
    this.x = side === 'left' ? x : roadWidth + roadsideWidth + x
    this.y = -Tree.height

    this.image = treeImg
  }

  move(game) {
    const speed = getSpeed(game)
    const { y } = this
    const { height: canvasHeight } = getCanvasProps(game)
    this.y += speed
    if (this.y > canvasHeight) {
      this.y = this.y - canvasHeight - Tree.height
    }
  }

  draw(ctx) {
    const { x, y } = this
    ctx.drawImage(this.image, x, y, Tree.width, Tree.height)
  }
}
Tree.width = 50
Tree.height = 100
