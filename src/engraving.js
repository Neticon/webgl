const THREE = require('three')
require('three-examples/controls/OrbitControls')
const { addDescription } = require('../lib/js-utils')
const dat = require('dat.gui')
const gui = new dat.GUI()

/** @type {THREE.Scene} */
let scene
/** @type {THREE.WebGLRenderer} */
let renderer
/** @type {THREE.PerspectiveCamera} */
let camera
/** @type {THREE.OrbitControls} */
let controls

const guiParams = {
  text: '',
}


init()

function init() {
  initDesc()
  initScene()
  initRenderer()
  initCamera()
  initLights()
  initControls()
  initMesh()
  initHelpers()
  initGui()
  bindWindowResize()

  renderer.setAnimationLoop(() => {
    update()
    render()
  })
}

function initDesc() {
  addDescription(`This is an egraving test {{nbsp}}
  `, 0xffffff, 0x303030ab)
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
  camera = new THREE.PerspectiveCamera(45, aspect, .1, 100)
  camera.position.set(0, 0, 15)

}
function initControls() {
  controls = new THREE.OrbitControls(camera, renderer.domElement)
}
function initMesh() {
  const geo = new THREE.SphereBufferGeometry(2, 32, 32)
  const material = new THREE.MeshPhongMaterial()
  const mesh = new THREE.Mesh(geo, material)
  scene.add(mesh)
}

function initGui() {
  gui.open()
  gui.add(guiParams, 'text').onChange(n => { })
}
function initHelpers() {
  const gridHelper = new THREE.GridHelper(10, 20)
  gridHelper.rotation.x = Math.PI / 2
  scene.add(gridHelper)
}
function update() {
 
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

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE