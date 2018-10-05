const jsUtil = require('../lib/js-utils')
const THREE = require('three')
require('three-examples/loaders/MTLLoader')
require('three-examples/loaders/OBJLoader')
require('three-examples/controls/OrbitControls')
require('three-examples/modifiers/SubdivisionModifier')
const dat = require('dat.gui')
let gui = new dat.GUI()

// window.__p = promisify(new THREE.OBJLoader().load)
const guiVars = {
  lightType: 'PointLight',
  lightAnimate: false,
  lightAnimateAxis: 'y',
  lightCH: false
}
const clock = new THREE.Clock()
const textureLoader = url => new THREE.TextureLoader().load(url)
const cubeTextureLoader = (() => {
  const loader = new THREE.CubeTextureLoader()
  const faces = ['px', 'nx', 'py', 'ny', 'pz', 'nz']
  return (path, extension) => {
    const urls = faces.map(face => `${path}${face}${extension}`)
    return loader.load(urls)
  }
})()

const radiants = degrees => Math.PI / 180 * degrees

const { innerWidth: WIDTH, innerHeight: HEIGHT } = window

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, .1, 1000)
// const camera = new THREE.OrthographicCamera(-15,15,15,-15,.1,1000)
const renderer = new THREE.WebGLRenderer({ antialias: true, precision: 'highp' })
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement)

renderer.setClearColor(0x202020)
renderer.setSize(WIDTH, HEIGHT)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

scene.fog = new THREE.FogExp2(0xffffff, 0)

var grid = new THREE.GridHelper(300, 10);
scene.add(grid); 1

camera.position.set(0, 0, 40)
camera.lookAt(new THREE.Vector3())

const ambientLight = getAmbientLight()
scene.add(ambientLight)

let light = {}
setLight(THREE[guiVars.lightType])

const geometry = new THREE.CubeGeometry(5,5,5,1,1,1)
const material = new THREE.MeshPhongMaterial({ color: 0xffaaaa, wireframe: true })

addMesh(geometry, material, -10, 'original')

makeSmooth(geometry, 0)

const renderLoop = () => {
  orbitControls.update()
  gui.updateDisplay()
  scene.getObjectByName('lightCH').visible = guiVars.lightCH
  renderer.render(scene, camera)
  requestAnimationFrame(renderLoop)
}

renderLoop()

setGui()

function makeSmooth(geometry, subdivisions){
  scene.remove(scene.getObjectByName('smooth'))
  const modifier = new THREE.SubdivisionModifier(subdivisions)
  const modified =  modifier.modify(geometry)
  addMesh(modified, material, 10, 'smooth')
}

function addMesh(geometry, material, xOffset, name) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.position.x = xOffset
  scene.add(mesh)
  return mesh
}
/**
 * @param {THREE.Mesh} mesh 
 */
function updateVertices(mesh) {
  const tDelta = clock.getElapsedTime()
  mesh.geometry.vertices.map((vertex, idx) => {
    vertex.z += (Math.sin(tDelta + idx * 0.5) * .0005)
  })
  mesh.geometry.verticesNeedUpdate = true

}
async function getModel(folder, filename) {
  mtlLoader.setPath(folder)
  objLoader.setPath(folder)
  const mtl = await mtlLoader.loadP(`${filename}.mtl`)
  mtl.preload()
  objLoader.setMaterials(mtl)
  const obj = await objLoader.loadP(`${filename}.obj`)
  // obj.children[0].geometry.computeVertexNormals()
  // centerObjectVertically(obj)
  scene.add(obj)
  setGui()
}

function getPlane(...args) {
  const geometry = new THREE.PlaneGeometry(...args)
  const material = new THREE.MeshPhongMaterial({ color: 0x0066aa, wireframe: false })
  material.side = THREE.BackSide
  const mesh = new THREE.Mesh(geometry, material)

  return mesh
}
function addCameraHelper(camera, name) {
  const helper = new THREE.CameraHelper(camera)
  helper.name = name
  scene.remove(scene.getObjectByName(name))
  scene.add(helper)
}
function getAmbientLight() {
  const light = new THREE.AmbientLight(0xffffff, 1)
  return light
}
function setLight(lightClass) {
  scene.remove(light)
  light = new lightClass(0xffffff, 1, 10000)
  const hasShadow = light.hasOwnProperty('shadow')
  light.name = 'light'
  light.castShadow = hasShadow
  const lightGeometry = new THREE.SphereGeometry(0.5, 20, 20)
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial)
  light.add(lightMesh)
  // light.position.set(-3, 2, 5)
  light.position.set(0, 20, 2)


  if (hasShadow) {
    //light.shadow.bias = -0.01 // not sure the fuck this does
    light.shadow.mapSize.width = 2048; // great, but FPS drops a lot
    light.shadow.mapSize.height = 2048; // great, but FPS drops a lot
    addCameraHelper(light.shadow.camera, 'lightCH')
  }
  scene.add(light)
  //light.target.position.set(0,0,-5)
}
function setGui() {
  gui.remember({})
  const _obj = {
    wireframe: true,
    subdivisions: 0,
    flatShading: true
  }
  const $scene = gui.addFolder('scene')
  $scene.open()
  const $fog = $scene.addFolder('fog')
  $fog.open()
  $fog.add(scene.fog, 'density', 0, 0.1, 0.001)

  const $light = gui.addFolder('light')
  $light.open()
  $light.add(guiVars, 'lightType', ['AmbientLight', 'SpotLight', 'PointLight', 'DirectionalLight']).onChange(val => {
    setLight(THREE[val])
    gui.destroy()
    gui = new dat.GUI()
    setGui()
  })
  $light.add(light, 'intensity', 0, 10)
  $light.add(light.position, 'x', -20, 20, .5)
  $light.add(light.position, 'y', -20, 20, .5)
  $light.add(light.position, 'z', -20, 20, .5)
  if (light.hasOwnProperty('penumbra')) {
    $light.add(light, 'penumbra', 0, 1, 0.01)
  }
  const $lightCamera = $light.addFolder('camera')
  $lightCamera.open()
  $lightCamera.add(guiVars, 'lightCH').name('camera helper')
  if (light.hasOwnProperty('shadow') && light.shadow.camera.hasOwnProperty('left')) {
    $lightCamera.add(light.shadow.camera, 'left', -10, 10, 1).name('shadow l').onChange(updateShadowsAndHelper)
    $lightCamera.add(light.shadow.camera, 'right', -10, 10, 1).name('shadow r').onChange(updateShadowsAndHelper)
    $lightCamera.add(light.shadow.camera, 'bottom', -10, 10, 1).name('shadow b').onChange(updateShadowsAndHelper)
    $lightCamera.add(light.shadow.camera, 'top', -10, 10, 1).name('shadow t').onChange(updateShadowsAndHelper)
  }
  const $geometry = gui.addFolder('geometry')
  $geometry.open()
  $geometry.add(_obj, 'wireframe').onChange(bool=>{
    scene.getObjectByName('original').material.wireframe = bool
    scene.getObjectByName('smooth').material.wireframe = bool
  })
  $geometry.add(_obj, 'flatShading').onChange(bool=>{
    scene.getObjectByName('original').material.flatShading = bool
    scene.getObjectByName('original').material.needsUpdate = true
    scene.getObjectByName('smooth').material.flatShading = bool
    scene.getObjectByName('smooth').material.needsUpdate = true
  })
  $geometry.add(_obj, 'subdivisions', 0, 5, 1).onChange(subdivisions =>{
    makeSmooth(geometry, subdivisions)
  })
  // const _face = scene.getObjectByName('Infinite')
  // $face.add(_face.material, 'roughness', 0, 1)
  // $face.add(_face.material, 'metalness', 0, 1)


  function updateShadowsAndHelper() {
    light.shadow.camera.updateProjectionMatrix()
    scene.getObjectByName('lightCH').update()
  }
}
function object3DGrid(n, gutter, object3D) {
  const group = new THREE.Group()
  const [w, h] = getHW(object3D)
  for (let i = 0; i < n; i++) {
    const obj = object3D.clone()
    obj.position.x = i * (gutter + w)
    group.add(obj)
    for (let j = 1; j < n; j++) {
      const obj = object3D.clone()
      obj.position.x = i * (gutter + w)
      obj.position.z = j * (gutter + h)
      group.add(obj)
    }
  }

  const dx = -((gutter + w) * (n - 1)) / 2
  const dz = -((gutter + h) * (n - 1)) / 2

  group.children.map(o => {
    o.position.x += dx
    o.position.z += dz
  })

  return group

}
function centerObjectVertically(object) {
  const boundingBox = getObject3dBoundingBox(object)
  object.position.y = boundingBox.y * -.5
}
function getObject3dBoundingBox(object) {
  return new THREE.Box3().setFromObject(object).getSize()
}
function getObject3DWH(object3D) {
  const objParams = object3D.geometry.parameters
  let h = null
  let w = null
  if (objParams.hasOwnProperty('height')) {
    h = objParams['height']
  } else if (objParams.hasOwnProperty('radius')) {
    h = objParams['radius'] * 2
  }
  if (h === null) {
    throw new Error('object3D has no height')
  }
  if (objParams.hasOwnProperty('width')) {
    w = objParams['width']
  } else if (objParams.hasOwnProperty('radius')) {
    w = objParams['radius'] * 2
  }
  if (w === null) {
    throw new Error('object3D has no height')
  }
  return [w, h]
}

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE