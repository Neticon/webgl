
const { innerWidth: W, innerHeight: H } = window
const THREE = require('three')
const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ antialias: true })
const camera = new THREE.PerspectiveCamera(45, W / H, 1, 100)
require('three-examples/controls/OrbitControls')
const controls = new THREE.OrbitControls(camera, renderer.domElement)

const mazeFactory = require("@mitchallen/maze-generator");
const TWEEN = require('@tweenjs/tween.js')
const { textureLoader } = require('../lib/three-utils')
init()
animate()

function init() {
  document.body.appendChild(renderer.domElement)
  renderer.setSize(W, H)
  renderer.setClearColor(0x303030)

  camera.position.set(0, 0, 30)

  const mazeW = 20
  const mazeH = 20
  const planeD = .5
  const mazeGen = mazeFactory.Square({ x: mazeW, y: mazeH })
  mazeGen.generate()
  //mazeGen.printBoard()
  makeEntranceAndExit(mazeGen)
  //mazeGen.printBoard()

  const light = getAmbientLight()
  scene.add(light)


  const maze = getMaze(mazeGen)
  maze.name = 'maze'
  const bbox = new THREE.Box3().setFromObject(maze)
  const size = bbox.getSize(new THREE.Vector3)
  const center = bbox.getCenter(new THREE.Vector3)
  maze.position.set(-center.x, -center.y, size.z / 2 + planeD / 2)
  // scene.add(maze)
  window.maze = maze
  window.mazeGen = mazeGen

  const plane = getPlane(size.x, size.y, planeD)
  plane.name = 'plane'
  scene.add(plane)

  const mc = getMC()
  //mc.position.set(...getEntrance(mazeGen),0)
  mc.name = 'mc'
  mc.position.z = 1
  scene.add(mc)

  window.__move = move.bind(null, mc)
}

function animate(time) {
  requestAnimationFrame(animate)
  TWEEN.update(time)
  render()
}

function render() {
  controls.update()
  renderer.render(scene, camera)
}

function getPlane(w, h, d) {
  const geometry = new THREE.BoxGeometry(w, h, d)
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: textureLoader('./assets/wood/Wood_Planks_009_COLOR.jpg'),
    normalMap: textureLoader('./assets/wood/Wood_Planks_009_NORM.jpg'),
    displacementMap: textureLoader('./assets/wood/Wood_Planks_009_DISP.png'),
    normalMap: textureLoader('./assets/wood/Wood_Planks_009_NORM.jpg'),
  })
  material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping
  material.map.repeat.set(4, 4)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.renderOrder = 0
  return mesh
}

function getAmbientLight() {
  const light = new THREE.AmbientLight(0xffffff, 1)
  return light
}

function getMaze(mazeGen) {
  const group = new THREE.Group()
  const { xSize: w, ySize: h } = mazeGen

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const _y = getYCoordsInArray(w, y)
      const sides = getCellSides(mazeGen.get(x, y), mazeGen.dirMap)
      const cell = getCell([x, _y, 0], sides)
      cell.name = 'cell'
      group.add(cell)
    }
  }
  return group
}

function getExit(mazeGen) {
  return [0, mazeGen.ySize - 1]
}
function getEntrance(mazeGen) {
  return [mazeGen.xSize - 1, 0]
}

function getYCoordsInArray(length, y) {
  return length - y - 1
}

function makeEntranceAndExit(mazeGen) {
  // add north blank to exit
  const exitCoord = [0, 0]
  const exit = mazeGen.get(...exitCoord)
  mazeGen.set(...exitCoord, exit | mazeGen.dirMap.N)
  // add south blank to to entrance
  const entranceCoords = [mazeGen.xSize - 1, mazeGen.ySize - 1]
  const entrance = mazeGen.get(...entranceCoords)
  mazeGen.set(...entranceCoords, entrance | mazeGen.dirMap.S)
}

function getCell(position, walls) {
  const group = new THREE.Group()
  walls.map(side => {
    const wall = getWall(getWallOptions(side))
    wall.name = side
    group.add(wall)
  })
  group.position.set(...position)
  return group
}
function getWallOptions(side) {
  return [
    getWallRotation(side),
    getWallPosition(side),
  ]
}
function getWallRotation(side) {
  const r = THREE.Math.degToRad.bind(THREE.Math)
  const sides = {
    N: [0, 0, 0],
    E: [0, 0, r(90)],
    S: [0, 0, 0],
    W: [0, 0, r(90)],
  }
  return sides[side]
}
function getWallPosition(side) {
  const sides = {
    N: [0, .5, 0],
    E: [.5, 0, 0],
    S: [0, -.5, 0],
    W: [-.5, 0, 0],
  }
  return sides[side]
}
function getCellSides(flag, map) {
  return Object.keys(map)
    .filter(side => !(flag & map[side]))
}
function getWall([rotation, position]) {
  const geometry = new THREE.BoxGeometry(1, .2, 1)
  const material = new THREE.MeshPhongMaterial({
    color: 0x606060,
    opacity: .8,
    transparent: true
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.set(...rotation)
  mesh.position.set(...position)
  return mesh
}

function getMC() {
  const geometry = new THREE.BoxGeometry(.5, .5, .5)
  const material = new THREE.MeshNormalMaterial({ color: 0xbada55 })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

function move(mc, dir) {
  const d = {
    pRot: '',
    vRot: '',
    pPos: '',
    vPos: ''
  }
  switch (dir) {
    case 'up':
      d.pRot = new THREE.Vector3(1, 0, 0)
      d.vRot = THREE.Math.degToRad(-5.8)
      d.pPos = 'y'
      d.vPos = 1
      break;
    case 'down':
      d.pRot = new THREE.Vector3(1, 0, 0)
      d.vRot = THREE.Math.degToRad(5.8)
      d.pPos = 'y'
      d.vPos = -1
      break;
    case 'right':
      d.pRot = new THREE.Vector3(0, 1, 0)
      d.vRot = THREE.Math.degToRad(5.8)
      d.pPos = 'x'
      d.vPos = 1
      break;
    case 'left':
      d.pRot = new THREE.Vector3(0, 1, 0)
      d.vRot = THREE.Math.degToRad(-5.8)
      d.pPos = 'x'
      d.vPos = -1
      break;
  }
  let obj = {
    rot: 0,
    pos: mc.position[d.pPos]
  }
  new TWEEN.Tween(obj)
    .to({
      rot: obj.rot + d.vRot,
      pos: obj.pos + d.vPos
    }, 1000)
    //.easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(function () {
      mc.position[d.pPos] = obj.pos
      rotateAroundWorldAxis(mc, d.pRot, obj.rot)
    })
    .start()
}

function rotateAroundObjectAxis(object, axis, radians) {
  const rotObjectMatrix = new THREE.Matrix4();
  rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
  object.matrix.multiply(rotObjectMatrix);
  object.rotation.setFromRotationMatrix(object.matrix);
}

// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
  const rotWorldMatrix = new THREE.Matrix4();
  rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
  rotWorldMatrix.multiply(object.matrix);                // pre-multiply
  object.matrix = rotWorldMatrix;
  object.rotation.setFromRotationMatrix(object.matrix);
}

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE