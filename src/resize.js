const THREE = require('three')
require('three/examples/js/controls/OrbitControls')
const { innerWidth: w, innerHeight: h } = window
const renderer = new THREE.WebGLRenderer({ antialias: true })
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, w / h)
const controls = new THREE.OrbitControls(camera, renderer.domElement)

const basis = 25



init()
animate()

function init() {
  renderer.setSize(w, h)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0xababab)
  document.body.appendChild(renderer.domElement)

  camera.position.set(0, 0, 5)
  camera.lookAt(new THREE.Vector3())

  const box = getCell([0, 0, 0], ['N', 'E', 'S', 'W', 'F', 'B'])
  box.name = 'box'
  scene.add(box)

}
function animate(time) {
  render()
  requestAnimationFrame(animate)
}
function render() {
  controls.update()
  renderer.render(scene, camera)
}
function getBox() {

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
    getWallSize(side),
    getWallPosition(side),
  ]
}
function getWallSize(side) {
  const sides = {
    N: [1, .005, 1],
    E: [.005, 0, 1],
    S: [1, .005, 1],
    W: [.005, 1, 1],
    F: [1, 1, .005],
    B: [1, 1, .005],
  }
  return sides[side]
}
function getWallPosition(side) {
  const sides = {
    N: [0, .5, 0],
    E: [.5, 0, 0],
    S: [0, -.5, 0],
    W: [-.5, 0, 0],
    F: [0, 0, .5],
    B: [0, 0, -.5],

  }
  return sides[side]
}
function getWall([size, position]) {
  const geometry = new THREE.BoxGeometry(...size)
  const material = new THREE.MeshPhongMaterial({
    color: 0xcdcdcd,
    opacity: .5,
    transparent: true
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  return mesh
}
function resize(dimension, amount) {
  const sides = {
    h: ['F', 'E', 'B', 'W'],
    w: ['F', 'B', 'N', 'S']
  }
  const sidesToResize = sides[dimension]
  const scaleToBasis = amount / basis
  const v3ScaleBasis = new THREE.Vector3()
  if (dimension === 'w') {
    v3ScaleBasis.set(scaleToBasis, 1, 1)
  } else {
    v3ScaleBasis.set(1, scaleToBasis, 1)
  }
  
  sidesToResize.map(side => {
    const obj = scene
    .getObjectByName('box')
    .getObjectByName(side)
    // get current scale
    // const v3ScaleCurrent = obj.scale
    // get new scale
    //const v3ScaleTo = v3ScaleBasis.clone().divide(v3ScaleCurrent)
    // do scaling
    //obj.scale.copy(v3ScaleTo)
    obj.translateY(.5)
    obj.scale.copy(v3ScaleBasis)
  })
}
/**
 * 
 * @param {THREE.Object3D} obj 
 */
function getDecomposedMatrix(obj) {
  const v3T = new THREE.Vector3()
  const v3S = new THREE.Vector3()
  const qR = new THREE.Quaternion()
  obj.matrix.decompose(v3T, v3S, qR)
  return [v3T, qR, v3S]
}

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE
window.resize = resize