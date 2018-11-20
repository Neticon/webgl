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
/** @type {HTMLCanvasElement} */
let canvas = document.createElement('canvas')
/** @type {THREE.Material} */
let material
/** @type {THREE.Texture} */
let engravingMap

const guiParams = {
  text: '🤖',
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
  initCanvas()
  initHelpers()
  initGui()
  bindWindowResize()
  once()

  renderer.setAnimationLoop(() => {
    update()
    render()
  })
}

function initDesc() {
  addDescription(`This is an egraving test {{nbsp}}

  There are mainly two ways to add text onto a 3d mesh. Refer to {fn{link(https://threejs.org/docs/index.html#manual/en/introduction/Creating-text,this threejs doc)}}.

  - 1. draw onto a 2d canvas, then use the canvas as a texture.
  This can be mapped to any material textureMap (diffuse, bump, normal...)
  - 2. create geometries for the letters and add them to the scene.

  1 seems to be more performant but with least realism, 2 does probably create better results
  especially if the text has to affect/be affected by lighting, shadows, but it is more resource hungry.

  In this example 1 was used, the resulting 2d canvas (bottom right) is used as diffuseMap and bumpMap.
  Type into the 'text' field to change engraving on the fly
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
  engravingMap = new THREE.Texture(canvas)
  engravingMap.anisotropy = renderer.capabilities.getMaxAnisotropy()
  engravingMap.generateMipmaps = true
  engravingMap.minFilter = THREE.LinearFilter
  engravingMap.mapFilter = THREE.LinearMipMapLinearFilter
  material = new THREE.MeshPhongMaterial({
    map: engravingMap,
    bumpMap: engravingMap,
    bumpScale:.005,
    color: 0x303030
  })
  const mesh = new THREE.Mesh(geo, material)
  mesh.rotation.y = THREE.Math.degToRad(-90)
  scene.add(mesh)
}
function initCanvas(){
  canvas.width = 1024 * 2 
  canvas.height = 512 * 2 
  canvas.style.position = 'absolute'
  canvas.style.bottom = 0
  canvas.style.right = 0
  canvas.style.border = '1px solid'
  canvas.style.maxWidth = '300px'
  document.body.appendChild(canvas)
}
function writeTextOnCanvas(text) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = '200px consolas'
  ctx.fillStyle = '#000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2, canvas.width - canvas.width * .1)
  engravingMap.needsUpdate = true
}
function initGui() {
  gui.open()
  gui.add(guiParams, 'text').onChange(writeTextOnCanvas)
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
function once(){
  writeTextOnCanvas(guiParams.text)
}
window.__scene = scene
window.__renderer = renderer
window.THREE = THREE