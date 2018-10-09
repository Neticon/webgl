const THREE = require('three')
const { textureLoader, objLoader, mtlLoader, KeyBinder, ObjRotator } = require('../lib/three-utils')
const { addDescription } = require('../lib/js-utils')
require('three-examples/controls/OrbitControls')


addDescription(`__wayfarer__

A wayfarer model rendered with the use of assets from VTO.
Using intuition for assigning textures to material map property.
Result is still far from optimal.
-------
use mouse to rotate scene.
use x, y, z [+ ctrlKey] to rotate model around axes.`, '#ffffff')

const { innerWidth: W, innerHeight: H } = window
const renderer = new THREE.WebGLRenderer({ antialias: true })
const camera = new THREE.PerspectiveCamera(45, W / H, 1, 1000)
const scene = new THREE.Scene()
const controls = new THREE.OrbitControls(camera, renderer.domElement)


const dat = require('dat.gui')
let gui = new dat.GUI()

renderer.setSize(W, H)
renderer.setClearColor(0xa0a0a0)
document.body.appendChild(renderer.domElement)

camera.position.set(0, 0, 10)
camera.lookAt(new THREE.Vector3())

const light = getLight()
light.position.set(0, -.5, 5)
scene.add(light)



setGui()
init()

async function init() {
  const group = new THREE.Group()
  const folder = './assets/models/wayfarer/'
  const lensesObj = await objLoader.loadP(`${folder}lens-paint.obj`)
  const lensesGeo = lensesObj.children[0].geometry
  const lensesMat = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    // color: 0xff0033,
    map: textureLoader(`${folder}lens-transpColor.png`),
    specularMap: textureLoader(`${folder}lens-diffColor.png`),
    alphaMap: textureLoader(`${folder}lens-_gradient.png`),
    opacity: .9,
    transparent: true,
    metalnessMap: textureLoader(`${folder}lens-_gradient.png`),
    // metalness: 0.5
  })
  const lensesMesh = new THREE.Mesh(lensesGeo, lensesMat)
  lensesMesh.name = 'lenses'
  group.add(lensesMesh)

  const frameObj = await objLoader.loadP(`${folder}frame-paint.obj`)
  const frameGeo = frameObj.children[0].geometry
  const frameMat = new THREE.MeshStandardMaterial({
    // side: THREE.DoubleSide,
    // color: 0xff0033,
    //lightMap:textureLoader(`${folder}frame-facingReflect.png`),
    map: textureLoader(`${folder}frame-transpColor.png`),
    specularMap: textureLoader(`${folder}frame-specColor.png`),
    bumpMap: textureLoader(`${folder}frame-bump.png`),
    opacity: .95,
    transparent: true,
    metalnessMap: textureLoader(`${folder}frame-_gradient.png`),
    // metalness: 0.5

  })
  const frameMesh = new THREE.Mesh(frameGeo, frameMat)
  frameMesh.name = 'frame'
  group.add(frameMesh)

  scene.add(group)

  new ObjRotator(group)
}

requestAnimationFrame(
  function render() {
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render)
  }
)
function getLight() {
  const light = new THREE.SpotLight(0xffffaa, .8)
  const lightGeometry = new THREE.SphereGeometry(0.2, 20, 20)
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial)
  light.add(lightMesh)
  light.shadow.bias = -0.01 // not sure the fuck this does
  light.shadow.mapSize.width = 2048; // great, but FPS drops a lot
  light.shadow.mapSize.height = 2048; // great, but FPS drops a lot
  return light
}

function setGui() {
  const $light = gui.addFolder('light')
  $light.open()
  $light.add(light, 'intensity', 0, 10)
  $light.add(light.position, 'x', -20, 20, .5)
  $light.add(light.position, 'y', -20, 20, .5)
  $light.add(light.position, 'z', -20, 20, .5)
  if (light.hasOwnProperty('penumbra')) {
    $light.add(light, 'penumbra', 0, 1, 0.01)
  }
}

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE
window.__KeyBinder = KeyBinder
