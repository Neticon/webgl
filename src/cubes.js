const THREE = require('three')
require('three-examples/controls/OrbitControls')
const dat = require('dat.gui')
let gui = new dat.GUI()
const guiVars = {
  lightType: 'SpotLight',
  lightAnimate: false,
  lightAnimateAxis: 'y',
  lightCH: false
}
const clock = new THREE.Clock()
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = (() => {
  const loader = new THREE.CubeTextureLoader()
  const faces = ['px', 'nx', 'py', 'ny', 'pz', 'nz']
  return (path, extension) => { 
    const urls = faces.map(face => `${path}${face}${extension}`)
    return loader.load(urls)
  }
})()

/**
 * returns radiants given degrees
 * @param {number} degrees  
 */
const radiants = degrees => Math.PI / 180 * degrees

const {innerWidth: WIDTH, innerHeight: HEIGHT} = window

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, .1, 1000)
// const camera = new THREE.OrthographicCamera(-15,15,15,-15,.1,1000)
const renderer = new THREE.WebGLRenderer({ antialias: true, precision: 'highp'})
const orbitControls = new THREE.OrbitControls(camera, renderer.domElement)


renderer.setSize(WIDTH, HEIGHT)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

scene.fog = new THREE.FogExp2(0xffffff, 0)
scene.background = cubeTextureLoader('./assets/cubemap/', '.jpg')

camera.position.set(0, 1, 15)

let light = {}
function setLight(lightClass) {
  scene.remove(light)
  light = new lightClass(0xffffaa, 1)
  const hasShadow = light.hasOwnProperty('shadow')
  light.name = 'light'
  light.castShadow = hasShadow
  // light.shadow.bias = -0.001 // not sure the fuck this does
  light.shadow.mapSize.width = 2048; // great, but FPS drops a lot
  light.shadow.mapSize.height = 2048; // great, but FPS drops a lot
  const lightGeometry = new THREE.SphereGeometry(0.1, 20, 20)
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
  const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial)
  light.add(lightMesh)
  // light.position.set(-3, 2, 5)
  light.position.set(0, 10, 0)
  scene.add(light)
  if (hasShadow) {
    addCameraHelper(light.shadow.camera, 'lightCH')
  }
}

setLight(THREE.PointLight)

function addCameraHelper(camera, name) {
  const helper = new THREE.CameraHelper(camera)
  helper.name = name
  scene.remove(scene.getObjectByName(name))
  scene.add(helper)
}

const planeGeometry = new THREE.PlaneGeometry(300, 300)
const planeMaterial = new THREE.MeshStandardMaterial({
  //color: 0x004455, 
  map: textureLoader.load('./assets/textures/concrete.jpg'),
  bumpMap: textureLoader.load('./assets/textures/concrete.jpg'),
  roughnessMap: textureLoader.load('./assets/textures/concrete.jpg'),
  envMap: cubeTextureLoader('./assets/cubemap/', '.jpg'),
  bumpScale: 0.01,
  roughness: 0.7,
  metalness: 0.1,

});
['map', 'bumpMap', 'roughnessMap', 'envMap'].map(name => {
  planeMaterial[name].wrapS = planeMaterial[name].wrapT = THREE.RepeatWrapping
  planeMaterial[name].repeat.set(15, 15)
})


const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
planeMesh.name = 'plane'
planeMesh.rotation.x = radiants(-90)
// planeMesh.position.y = -10
planeMesh.receiveShadow = true

scene.add(planeMesh)


// const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const sphereGeometry = new THREE.BoxGeometry(1, 1, 1)
const sphereMaterial = new THREE.MeshPhongMaterial({
  // color: 0xaaff44,
  // roughnessMap: loader.load('./assets/textures/fingerprints.jpg'),
  envMap: cubeTextureLoader('./assets/cubemap/', '.jpg')
  // specularMap: loader.load('./assets/textures/fingerprints.jpg'),
})
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
sphereMesh.name = 'sphere'
sphereMesh.castShadow = true
sphereMesh.receiveShadow = true
const sphereGroup = object3DGrid(10, .5, sphereMesh)
sphereGroup.name = 'sphereGroup'
sphereGroup.rotation.x = radiants(-90)
sphereGroup.position.z = getHW(sphereMesh)[1] / 2

planeMesh.add(sphereGroup)
//scene.add(sphereGroup)

camera.lookAt(new THREE.Vector3())
let rads = 0
const renderLoop = () => {
  orbitControls.update()
  if (guiVars.lightAnimate) {
    rads = rads + .5 % 360
    light.position[guiVars.lightAnimateAxis] = Math.sin(radiants(rads)) * 2.5 + 2.7  // sphereGroup.rotation.x += radiants(1)
  }
  scene.getObjectByName('lightCH').visible = guiVars.lightCH
  // sphereGroup.rotation.y += radiants(1)
  // planeMesh.rotation.x += radiants(1)
  updateCubes()
  renderer.render(scene, camera)
  gui.updateDisplay()
  requestAnimationFrame(renderLoop)
}

renderLoop()
setGui()

function setGui() {
  const _sphereMat = Object.defineProperty({}, 'color', {
    get() { return '#' + sphereMesh.material.color.getHexString() },
    set(hex) { sphereMesh.material.color = new THREE.Color(hex) }
  })
  const $scene = gui.addFolder('scene')
  const $fog = $scene.addFolder('fog')
  $fog.add(scene.fog, 'density', 0, 0.1, 0.001)

  const $light = gui.addFolder('light')
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
  $light.add(guiVars, 'lightAnimate').name('animate')
  $light.add(guiVars, 'lightAnimateAxis', ['x', 'y', 'z']).name('animate axis')
  const $lightCamera = $light.addFolder('camera')
  $lightCamera.add(guiVars, 'lightCH').name('camera helper')
  if (light.hasOwnProperty('shadow') && light.shadow.camera.hasOwnProperty('left')) {
    $lightCamera.add(light.shadow.camera, 'left', -10, 10, 1).name('shadow l').onChange(updateShadowsAndHelper)
    $lightCamera.add(light.shadow.camera, 'right', -10, 10, 1).name('shadow r').onChange(updateShadowsAndHelper)
    $lightCamera.add(light.shadow.camera, 'bottom', -10, 10, 1).name('shadow b').onChange(updateShadowsAndHelper)
    $lightCamera.add(light.shadow.camera, 'top', -10, 10, 1).name('shadow t').onChange(updateShadowsAndHelper)
  }
  const $plane = gui.addFolder('plane')
  $plane.add(planeMesh.material, 'roughness', 0, 1)
  $plane.add(planeMesh.material, 'metalness', 0, 1)

  $scene.open()
  $fog.open()
  $light.open()
  $lightCamera.open()
  $plane.open()

  // $sphere.open()
  // const $camera = gui.addFolder('camera')
  // $camera.add(camera.position, 'x', -20, 20, .5)
  // $camera.add(camera.position, 'y', -20, 20, .5)
  // $camera.add(camera.position, 'z', -20, 20, .5)
  // $camera.add(lookAt, 'enable').name('lookat')
  function updateShadowsAndHelper() {
    light.shadow.camera.updateProjectionMatrix()
    scene.getObjectByName('lightCH').update()
  }
}

function updateCubes() {
  const cubeGroup = scene.getObjectByName('sphereGroup')
  const elapsedTime = clock.getElapsedTime()
  cubeGroup.children.map((cube, idx) => {
    cube.scale.y = (Math.sin(elapsedTime * 4 + idx) + 1) / 2 + 0.01
    cube.position.y = cube.geometry.parameters.height * cube.scale.y / -2 + .5
  })
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
function getHW(object3D) {
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
window.THREE = THREE