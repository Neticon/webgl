const jsUtil = require('../lib/js-utils')
const THREE = require('three')
require('three-examples/loaders/MTLLoader')
require('three-examples/loaders/OBJLoader')
require('three-examples/controls/OrbitControls')
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
const objLoader = new THREE.OBJLoader()
objLoader.loadP = jsUtil.promifyFn(objLoader.load.bind(objLoader), 1, 'rsv')
const mtlLoader = new THREE.MTLLoader()
mtlLoader.loadP = jsUtil.promifyFn(mtlLoader.load.bind(mtlLoader), 1, 'rsv')
mtlLoader.crossOrigin = true

const radiants =  degrees => Math.PI / 180 * degrees

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

camera.position.set(0, 0, 1.2)
camera.lookAt(new THREE.Vector3())

let light = {}
setLight(THREE[guiVars.lightType])

const _meshes = {}

getObjects()

const renderLoop = () => {
  orbitControls.update()
  gui.updateDisplay()
  scene.getObjectByName('lightCH').visible = guiVars.lightCH
  renderer.render(scene, camera)
  requestAnimationFrame(renderLoop)
}

renderLoop()

async function getObjects(){
  const head = await getObj('./assets/models/head/', 'lee-perry-smith-head-scan')
  head.name = 'head'
  head.position.y=-0.25
  const model = await getModel()
  model.name = 'model'
  model.scale.set(0.0114,0.0112,0.0112)
  model.position.z=-0.04
  model.position.y=.28
  head.add(model)
  scene.add(head)
}
async function getObj(folder, filename) {
  mtlLoader.setPath(folder)
  objLoader.setPath(folder)
  const mtl = await mtlLoader.loadP(`${filename}.mtl`)
  mtl.preload()
  objLoader.setMaterials(mtl)
  const obj = await objLoader.loadP(`${filename}.obj`)
  return obj
}
async function getModel() {
  const modelGroup = new THREE.Group()
  modelGroup.name = 'meteor'
  const frame = await getObj('./assets/models/meteor/', 'Frame')
  const lenses = await getObj('./assets/models/meteor/', 'Lenses')
  const temple = await getObj('./assets/models/meteor/', 'Temple')
  modelGroup.add(frame)
  modelGroup.add(lenses)
  modelGroup.add(temple);
  modelGroup.traverse(mesh => {
    if (mesh.type === 'Mesh') {
      mesh.receiveShadow = true
      mesh.castShadow = true
      mesh.material.flatShading = false
    }
  })
  modelGroup.traverse(mesh => {
    if (mesh.type === 'Mesh') {
      const _mesh = _meshes[mesh.name] = {}
      if(mesh.material instanceof Array){
        mesh.material.map(mat=>{
          _mesh[mat.name]= '#' + mat.color.getHexString()
        })
      }else{
        _mesh[mesh.material.name]= '#' + mesh.material.color.getHexString()
      }
    }
  })
  return modelGroup
}
function addCameraHelper(camera, name) {
  const helper = new THREE.CameraHelper(camera)
  helper.name = name
  scene.remove(scene.getObjectByName(name))
  scene.add(helper)
}
function setLight(lightClass) {
  scene.remove(light)
  light = new lightClass(0xffffaa, 1, 10000)
  const hasShadow = light.hasOwnProperty('shadow')
  light.name = 'light'
  light.castShadow = hasShadow
  const lightGeometry = new THREE.SphereGeometry(0.5, 20, 20)
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial)
  light.add(lightMesh)
  // light.position.set(-3, 2, 5)
  light.position.set(0, 1.5, 2)


  if (hasShadow) {
    light.shadow.bias = -0.01 // not sure the fuck this does
    light.shadow.mapSize.width = 2048; // great, but FPS drops a lot
    light.shadow.mapSize.height = 2048; // great, but FPS drops a lot
    addCameraHelper(light.shadow.camera, 'lightCH')
  }
  scene.add(light)
  //light.target.position.set(0,0,-5)
}
function setGui() {
  gui.remember({})
  const $scene = gui.addFolder('scene')
  $scene.open()

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
  const $face = gui.addFolder('face')
  $face.open()
  const _face = scene.getObjectByName('Infinite')
  $face.add(_face.material, 'roughness', 0, 1)
  $face.add(_face.material, 'metalness', 0, 1)


  function updateShadowsAndHelper() {
    light.shadow.camera.updateProjectionMatrix()
    scene.getObjectByName('lightCH').update()
  }
}

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE