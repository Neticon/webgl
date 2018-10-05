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
objLoader.loadP = jsUtil.promifyFn(objLoader.load.bind(objLoader),1,'rsv')
const mtlLoader = new THREE.MTLLoader()
mtlLoader.loadP = jsUtil.promifyFn(mtlLoader.load.bind(mtlLoader),1,'rsv')

const radiants = degrees => Math.PI / 180 * degrees

const $cont = document.querySelector('.webgl-wrap')
const {innerWidth: WIDTH, innerHeight: HEIGHT} = window

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

camera.position.set(0, 0, 1.2)
camera.lookAt(new THREE.Vector3())

let light = {}
setLight(THREE[guiVars.lightType])


getModel()


// ;['map', 'bumpMap', 'normalMap'].map(propKey=>{
//   planeMesh.material[propKey].wrapS = planeMesh.material[propKey].wrapT = THREE.RepeatWrapping
//   planeMesh.material[propKey].repeat.set(10,10)
// })

const renderLoop = () => {
  orbitControls.update()
  gui.updateDisplay()
  scene.getObjectByName('lightCH').visible = guiVars.lightCH
  renderer.render(scene, camera)
  requestAnimationFrame(renderLoop)
}

renderLoop()

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
async function getModel() {
  mtlLoader.setPath('./assets/models/head/')
  objLoader.setPath('./assets/models/head/')
  const mtl = await mtlLoader.loadP('lee-perry-smith-head-scan.mtl')
  mtl.preload()
  objLoader.setMaterials(mtl)
  const obj = await objLoader.loadP('lee-perry-smith-head-scan.obj')
  console.log(mtl)
  console.log(obj)
  obj.position.y = -.2
  scene.add(obj)
  // objLoader.load('./assets/models/head/lee-perry-smith-head-scan.obj', function (model) {
  //   window.__mesh = model
  //   const plane = model.getObjectByName('Plane')
  //   const face = model.getObjectByName('Infinite')
  //   plane.visible = false
  //   const map = textureLoader('./assets/models/head/Face_Color.jpg')
  //   const bumpMap = textureLoader('./assets/models/head/Face_Disp.jpg')
  //   const faceMaterial = new THREE.MeshStandardMaterial({
  //     color: 0xffffff,
  //     map,
  //     bumpMap,
  //     bumpScale: 0.003,
  //     roughnessMap: bumpMap,
  //     roughness: .76,
  //     metalness: 0,


  //   })
  //   face.material = faceMaterial

  //   model.position.y = -.2
  //   scene.add(model)
    setGui()
  // })
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