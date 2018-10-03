const THREE = require('three')
require('imports-loader?THREE=three!three-examples/controls/OrbitControls')
const dat = require('dat.gui')
let gui = new dat.GUI()

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

camera.position.set(0, 0, 100)
camera.lookAt(new THREE.Vector3())

let light = {}
setLight(THREE[guiVars.lightType])


const particleMesh = getParticles(30, 128)
scene.add(particleMesh)


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
setGui()

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
function getParticles(radius, segments) {
  const geometry = new THREE.SphereGeometry(radius,segments,segments)
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: .5,
    map: textureLoader('./assets/textures/particle.jpg'),
    transparent: false,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  geometry.vertices.map((vertex, idx)=>{
    vertex.x += (Math.random() -.5) * 2
    vertex.y += (Math.random() -.5) * 2
    vertex.z += (Math.random() -.5) * (idx % 40)
  })
  const mesh = new THREE.Points(geometry, material)
  return mesh
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
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
  const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial)
  light.add(lightMesh)
  // light.position.set(-3, 2, 5)
  light.position.set(0, 0, 0)


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