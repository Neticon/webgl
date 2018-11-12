const THREE = require('three')
require('three-examples/controls/OrbitControls')
require('three-examples/controls/OrbitControls')
const {objLoader} = require('../lib/three-utils')

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
  initObject()
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
  camera = new THREE.PerspectiveCamera(45, aspect, .1, 100)
  camera.position.set(0, 0, 5)
}
function initControls() {
  controls = new THREE.OrbitControls(camera, renderer.domElement)
}
function initHelpers(){
  const gridHelper = new THREE.GridHelper(10,20)
  gridHelper.rotation.x = Math.PI / 2
  scene.add(gridHelper)
}
async function initObject(){
  /** @type {THREE.Object3D} */
  const obj = await objLoader.loadP('./assets/models/Box.obj')
  
  obj.traverse(child=>{
    if(child.isMesh){
      child.material.color = new THREE.Color(0x303030)
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  obj.scale.set(.05,.05,.05)
  centerObj(obj)
  scene.add(obj)
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
function centerObj(obj, axes = 'xy'){
  const bbox = new THREE.Box3().setFromObject(obj)
  const center = bbox.getCenter(new THREE.Vector3())
  const axesArr =  axes.split('')
  axesArr.map(axis => {
    obj.position[axis]+= -center[axis]
  })
}
window.__scene = scene
window.__renderer = renderer
window.THREE = THREE