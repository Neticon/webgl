const { addDescription } = require('../lib/js-utils')
const { textureLoader } = require('../lib/three-utils')
const THREE = require('three')
const gui = new (require('dat.gui')).GUI()
require('three-examples/controls/OrbitControls')
require('three-examples/postprocessing/EffectComposer')
require('three-examples/postprocessing/RenderPass')
require('three-examples/postprocessing/TexturePass')
require('three-examples/postprocessing/ShaderPass')
require('three-examples/shaders/CopyShader')
require('three-examples/shaders/VignetteShader')
require('three-examples/shaders/SepiaShader')
require('three-examples/shaders/MirrorShader')
require('three-examples/shaders/BlendShader')

/** @type {THREE.Scene} */
let scene
/** @type {THREE.WebGLRenderer} */
let renderer
/** @type {THREE.PerspectiveCamera} */
let camera
/** @type {THREE.OrbitControls} */
let controls
/** @type {THREE.Texture} */
let texture
/** @type {THREE.Texture} */
let texture2
/** @type {THREE.EffectComposer} */
let composer


const guiParams = {
  mixRatio: .5,
  opacity: 1,
  offset: 1,
  darkness: 1,

}


init()

function init() {
  initDesc()
  initScene()
  initRenderer()
  initCamera()
  initLights()
  initControls()
  initMaterial()
  //initHelpers()
  initEffectComposer()
  initMesh()
  initGui()
  bindWindowResize()
  once()

  renderer.setAnimationLoop(() => {
    update()
    render()
  })
}

function initDesc() {
  addDescription(`This a test using effect composer for materials {{nbsp}}{{nbsp}}
  Although not documented anywhere (that I could find)
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
  camera.position.set(0, 0, 5)

}
function initControls() {
  controls = new THREE.OrbitControls(camera, renderer.domElement)
}
function initMesh() {
  const geo = new THREE.BoxBufferGeometry(1, 1, 1)
  const material = new THREE.MeshBasicMaterial({
    map: composer.renderTarget2.texture
  })
  const mesh = new THREE.Mesh(geo, material)
  scene.add(mesh)
}
function initMaterial() {
  texture = textureLoader('./assets/textures/shader.jpg')
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  texture2 = textureLoader('./assets/models/meteor/diffuse.png')
  texture2.premultiplyAlpha = true
}
function initEffectComposer() {
  composer = new THREE.EffectComposer(renderer)
  /* not using renderPass because input isn't scene */
  // const renderPass = new THREE.RenderPass(scene, camera)
  
  /* TexturePass works fine for texture input, using blendShader in this case
  so to be able to mix 2 textures */
  // const texturePass = new THREE.TexturePass(texture)
  
  const blendShaderPass = composer.blendShaderPass = new THREE.ShaderPass(THREE.BlendShader)
  blendShaderPass.uniforms['tDiffuse1'].value = texture
  blendShaderPass.uniforms['tDiffuse2'].value = texture2
  const vignetteShaderPass = composer.vignetteShaderPass = new THREE.ShaderPass(THREE.VignetteShader)

  /* feed composer with the two passes. call composer.render() on each update and use
    composer.renderTarget2.texture as material map
   */
  composer.addPass(blendShaderPass)
  composer.addPass(vignetteShaderPass)
}
function initGui() {
  gui.open()
  const blend = gui.addFolder('blend shader')
  blend.open()
  blend.add(guiParams, 'mixRatio', 0, 1, .1).onChange(v=>{composer.blendShaderPass.uniforms['mixRatio'].value = v})
  blend.add(guiParams, 'opacity', 0, 1, .1).onChange(v=>{composer.blendShaderPass.uniforms['opacity'].value = v})
  const vignette = gui.addFolder('vignette shader')
  vignette.open()
  vignette.add(guiParams, 'offset', 0, 1, .1).onChange(v=>{composer.vignetteShaderPass.uniforms['offset'].value = v})
  vignette.add(guiParams, 'darkness', 0, 1, .1).onChange(v=>{composer.vignetteShaderPass.uniforms['darkness'].value = v})
}
function initHelpers() {
  const gridHelper = new THREE.GridHelper(10, 20)
  gridHelper.rotation.x = Math.PI / 2
  scene.add(gridHelper)
}
function once() {
  //composer.render()
}
function update() {
  composer.render()
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
window.__composer = composer
