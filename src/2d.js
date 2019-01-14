const THREE = require('three')
require('three-examples/controls/OrbitControls')
// require('three-examples/controls/DragControls')
const { addDescription, getSizeMaxShapeIntoShape } = require('../lib/js-utils')
const { textureLoader } = require('../lib/three-utils')
require('./style/2d.css')

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
/** @type {THREE.Group} */
const group = new THREE.Group()
/** @type {THREE.Group} */
const sprites = new THREE.Group()

let rotation = 0
let sizeSuffix = 's2'
let fra = 'silver'
let canvasSize = {
  w: window.innerWidth,
  h: window.innerHeight
}

const guiParams = {
  rotation,
  sizeSuffix,
  fra
}

const parts = [
  { code: 'sha', variant: 'shadows', sprite: '', spritecoords: '', sizeSuffix: sizeSuffix },
  { code: 'fra', variant: 'silver', sprite: '', spritecoords: '', sizeSuffix: sizeSuffix },
  { code: 'def', variant: 'default', sprite: '', spritecoords: '', sizeSuffix: sizeSuffix },
  { code: 'led', variant: 'xenon', sprite: '', spritecoords: '', sizeSuffix: sizeSuffix },
  { code: 'whe', variant: 'alloy_gold', sprite: '', spritecoords: '', sizeSuffix: sizeSuffix },

]
init()

function init() {
  initDesc()
  initScene()
  initRenderer()
  initCamera()
  initLights()
  initControls()
  initSprites()
  initHelpers()
  initGui()
  bindWindowResize()

  renderer.setAnimationLoop(() => {
    update()
    render()
  })
}

function initDesc() {
  addDescription(`This is a test to render 2d assets with webgl {{nbsp}}.
  Each layer is a {fn{link(https://threejs.org/docs/#api/en/objects/Sprite, THREE.Sprite)}} object (plane with diffuse map).

  Sprite object size is the size of the crop from the sprite image.
  Sprite object position are taken from the spritecoords.json and adapted to make them 
  work with webgl coords system (offset from 0,0 rather than top-left corner).

  Assets in webgl needs to be pow2, THREE.js resizes each assets at runtime.
  Calculations need to work with the final resized assets dimensions. 
  `, 0xffffff, 0x303030ab)
}
function initScene() {
  scene = new THREE.Scene()
  scene.add(sprites)
}
function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, precision: 'highp' })
  renderer.setClearColor(0xe9ebed)
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
function initSprites() {
  parts.map(initSprite)
}
function initSprite(part) {
  const tex = textureLoader(getAsset(part))
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  const mat = new THREE.SpriteMaterial({ map: tex })
  const sprite = new THREE.Sprite(mat)
  sprite.name = part.code
  part.sprite = sprite
  sprites.add(sprite)
  getCoords(part)
}

function initGui() {

  gui.open()
  gui.add(guiParams, 'rotation', 0, 23, 1).onChange(val => { rotation = val })
  gui.add(guiParams, 'sizeSuffix', ['s0', 's1', 's2', 's3']).onChange(val => { sizeSuffix = val })
  gui.add(guiParams, 'fra', ['black', 'blue', 'chalk', 'orange', 'red', 'silver', 'white', 'yellow']).onChange(val => { fra = val })

}
function initHelpers() {
  // const gridHelper = new THREE.GridHelper(18, 20)
  // gridHelper.rotation.x = Math.PI / 2
  // scene.add(gridHelper)
}
function update() {
  updateSuffix()
  updateVariant()
  updateRotation()
}
function fixCanvasSize() {
  const imageSize = (parts.find(x => x.spritecoords) || {}).spritecoords.image
  if (!imageSize) { return }

  const canvasBestFit = getSizeMaxShapeIntoShape(
    { w: window.innerWidth, h: window.innerHeight },
    imageSize.w / imageSize.h
  )

  if (canvasBestFit.w === canvasSize.w && canvasBestFit.h === canvasSize.h) {
    return
  }

  canvasSize.w = canvasBestFit.w
  canvasSize.h = canvasBestFit.h
}
function updateRotation() {
  for (const part of parts) {
    const { sprite, spritecoords } = part
    if (!spritecoords || !sprite.material.map.image) { return }

    const map = sprite.material.map
    const fragSprite = spritecoords.frags[rotation].coordsInSprite
    const fragImage = spritecoords.frags[rotation].coordsInImg
    const imageSize = spritecoords.image
    const spriteSize = spritecoords.sprite
    const resized = {
      w: THREE.Math.floorPowerOfTwo(spriteSize.w),
      h: THREE.Math.floorPowerOfTwo(spriteSize.h)
    }
    const fix = {
      w: resized.w / spriteSize.w,
      h: resized.h / spriteSize.h,
    }


    const offsetx = fragSprite.x * fix.w / resized.w
    const offsety = 1 - (fragSprite.h * fix.h / resized.h) - (fragSprite.y * fix.h / resized.h)
    const repeatx = fragSprite.w * fix.w / resized.w
    const repeaty = fragSprite.h * fix.h / resized.h

    map.repeat.set(repeatx, repeaty)
    map.offset.set(offsetx, offsety)

    const unit = .012
    sprite.scale.set(
      fragSprite.w * (canvasSize.w / imageSize.w) * unit,
      fragSprite.h * (canvasSize.h / imageSize.h) * unit,
    )
    sprite.position.set(
      (fragImage.x + (fragImage.w / 2) - (imageSize.w / 2)) * (canvasSize.w / imageSize.w) * unit,
      -(fragImage.y + (fragImage.h / 2) - (imageSize.h / 2)) * (canvasSize.h / imageSize.h) * unit,
      0
      // //   (fragImage.x / imageSize.w) * 2 - 1,
      // //   (fragImage.y / imageSize.h) * 2 + 1
    )
  }
}
function updateSuffix() {
  for (const part of parts) {
    if (sizeSuffix !== part.sizeSuffix) {
      part.sizeSuffix = sizeSuffix
      getCoords(part)
      part.sprite.material.map = textureLoader(getAsset(part))
      part.sprite.material.needsUpdate = true
    }
  }
}
function updateVariant() {
  const _fra = parts.find(x=>x.code === 'fra')
  if (_fra.variant !== fra) {
    _fra.variant = fra
    getCoords(_fra)
    _fra.sprite.material.map = textureLoader(getAsset(_fra))
    _fra.sprite.material.needsUpdate = true
  }
}
function render() {
  renderer.render(scene, camera)
}
function getAsset(part) {
  const suffix = part.code === 'sha' ? 's0' : part.sizeSuffix
  return `http://assets.neticon.it/uniqonrepository/pc/porsche/c/${part.code}/${part.variant}/sprite_${suffix}.png`
}
function getCoords(part) {
  const suffix = part.code === 'sha' ? 's0' : part.sizeSuffix
  fetch(`http://assets.neticon.it/uniqonrepository/pc/porsche/c/${part.code}/${part.variant}/spritecoords_${suffix}.json`)
    .then(res => res.json())
    .then(res => { part.spritecoords = res })
    .then(onWindowResize)
}
function bindWindowResize() {
  window.addEventListener('resize', onWindowResize)
}
function onWindowResize() {
  fixCanvasSize()
  const { w: W, h: H } = canvasSize
  const aspect = W / H
  camera.aspect = aspect
  camera.updateProjectionMatrix()
  renderer.setSize(W, H)
}

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE