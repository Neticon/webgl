const jsUtil = require('../lib/js-utils')
const THREE = require('three')
require('three-examples/loaders/MTLLoader')
require('three-examples/loaders/OBJLoader')
require('three-examples/controls/OrbitControls')
require('three-examples/modifiers/SubdivisionModifier')
const dat = require('dat.gui')
let gui = new dat.GUI()

const guiVars = {
  lightType: 'SpotLight',
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
mtlLoader.crossOrigin = true
mtlLoader.loadP = jsUtil.promifyFn(mtlLoader.load.bind(mtlLoader), 1, 'rsv')
const radiants = degrees => Math.PI / 180 * degrees
const { innerWidth: WIDTH, innerHeight: HEIGHT } = window
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, .1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true, precision: 'highp' })
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement)

renderer.setClearColor(0x202020)
renderer.setSize(WIDTH, HEIGHT)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

scene.fog = new THREE.FogExp2(0xffffff, 0)

const plane = getPlane(40, 40)
plane.rotation.x = radiants(-90)
plane.receiveShadow = true
scene.add(plane);

camera.position.set(0, 10, 40)
camera.lookAt(new THREE.Vector3())

const ambientLight = getAmbientLight()
scene.add(ambientLight)

let light = {}
setLight(THREE[guiVars.lightType])

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
      mesh.receiveShadow = false
      mesh.castShadow = false
      mesh.material.flatShading = false
    }
  })
  scene.add(modelGroup)

  const _meshes = {}
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
  setGui(_meshes)
}

getModel()

const renderLoop = () => {
  orbitControls.update()
  gui.updateDisplay()
  scene.getObjectByName('lightCH').visible = guiVars.lightCH
  renderer.render(scene, camera)
  requestAnimationFrame(renderLoop)
}

renderLoop()

function getSmooth(geometry, subdivisions) {
  // scene.remove(scene.getObjectByName('smooth'))
  const modifier = new THREE.SubdivisionModifier(subdivisions)
  const modified = modifier.modify(geometry)
  // addMesh(modified, material, 10, 'smooth')
  return modified
}
async function getObj(folder, filename) {
  mtlLoader.setPath(folder)
  objLoader.setPath(folder)
  const mtl = await mtlLoader.loadP(`${filename}.mtl`)
  mtl.preload()
  objLoader.setMaterials(mtl)
  const obj = await objLoader.loadP(`${filename}.obj`)
  const child = obj.children[0]
  const geometry = getSmooth(child.geometry, 3)
  child.geometry = geometry
  return child
}
function getPlane(...args) {
  const geometry = new THREE.PlaneGeometry(...args)
  const material = new THREE.MeshPhongMaterial({color: 0xbfbfbf, wireframe: false })
  // const material = new THREE.ShadowMaterial({opacity:.5})
  material.side = THREE.DoubleSide
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
  light = new lightClass(0xffffff, .4, 100)
  const hasShadow = light.hasOwnProperty('shadow')
  light.name = 'light'
  light.castShadow = hasShadow
  const lightGeometry = new THREE.SphereGeometry(0.5, 20, 20)
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial)
  light.add(lightMesh)
  light.position.set(-13, 7.5, 14)

  if (hasShadow) {
    light.shadow.mapSize.width = 2048; // great, but FPS drops a lot
    light.shadow.mapSize.height = 2048; // great, but FPS drops a lot
    addCameraHelper(light.shadow.camera, 'lightCH')
  }
  scene.add(light)
}
function setGui(_meshes) {
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
  $light.add(light, 'distance', 0, 1000)
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
  
  Object.entries(_meshes).map(([mesh, mats])=>{
    const $mesh = $scene.addFolder(mesh)
    $mesh.open()
    Object.entries(mats).map(([mat, color])=>{
      $mesh.addColor(mats, mat).onChange(val=>{
        const __mesh = scene.getObjectByName(mesh)
        let __material
        if(__mesh.material instanceof Array){
          __material = __mesh.material.find(x=>x.name === mat)
        } else {
          __material = __mesh.material
        }
        __material.color.set(val)
      })
    })
  })

  function updateShadowsAndHelper() {
    light.shadow.camera.updateProjectionMatrix()
    scene.getObjectByName('lightCH').update()
  }
}

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE