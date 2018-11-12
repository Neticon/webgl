const THREE = require('three')
require('three-examples/controls/OrbitControls')
const GridGeometry = require('../lib/GridGeometry')
const Kripto = require('../lib/Kripto')

/** @type {THREE.Scene} */
let scene
/** @type {THREE.WebGLRenderer} */
let renderer
/** @type {THREE.PerspectiveCamera} */
let camera
/** @type {THREE.OrbitControls} */
let controls


init()

function init() {
  initScene()
  initRenderer()
  initCamera()
  initLights()
  initControls()
  initGrid()
  initHelpers()
  bindWindowResize()

  renderer.setAnimationLoop(() => {
    update()
    render()
  })
}

function initScene() {
  scene = new THREE.Scene()
}
function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setClearColor(0xababab)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)
}
function initLights() {
  const ambientLight = new THREE.AmbientLight(0x303030)
  const directionalLight = new THREE.DirectionalLight(0xffffff, .75)

  scene.add(ambientLight)
  camera.add(directionalLight)
  scene.add(camera)
}
function initCamera(light) {
  const aspect = window.innerWidth / window.innerHeight
  camera = new THREE.PerspectiveCamera(45, aspect, 1, 100)
  camera.position.set(0, 0, 5)
}
function initControls() {
  controls = new THREE.OrbitControls(camera, renderer.domElement)
}
function initGrid(){
  const grid = new GridGeometry(5,3,3,.5,.03)
  scene.add(grid)
}
function initHelpers(){
  const gridHelper = new THREE.GridHelper(10,20)
  gridHelper.rotation.x = Math.PI / 2
  scene.add(gridHelper)
}
function update() {
  // controls.update()
}
function render() {
  renderer.render(scene, camera)
}
function bindWindowResize() {
  window.addEventListener('resize', onWindowResize)
}
function onWindowResize() {
  const { innerWidth: W, innerHeight: H } = window
  const aspect = W / H
  camera.aspect = aspect
  camera.updateProjectionMatrix()
  renderer.setSize(W, H)
}

var kv = new Kripto.VerticalModule('k1', 200, 300)

window.__k = Kripto
window.__kv = kv


window.__scene = scene
window.__renderer = renderer
window.THREE = THREE