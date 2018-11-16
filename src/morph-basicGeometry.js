const THREE = require('three')
require('three-examples/controls/OrbitControls')
const { textureLoader } = require('../lib/three-utils')
const { addDescription } = require('../lib/js-utils')
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
/** @type {THREE.Mesh} */
let mesh

let morphMaterialDictionary

init()

function init() {
  initDesc()
  initScene()
  initRenderer()
  initCamera()
  initLights()
  initControls()
  initMesh()
  initHelpers()
  initGui()
  bindWindowResize()

  renderer.setAnimationLoop(() => {
    update()
    render()
  })
}

function initDesc() {
  addDescription(`This is a test with morphTargets for a primitive geometry (cube).
  Other than the visible target cube, 3 other clones are created at runtime.
  Each cloned cube has a scale transformation applied (width, height, depth)
  and the resulting vertices are used as morphTargets for the visible cube.
  TextureMaps (seamless) are repeated so to cover the object size as it expands.
  Only diffuseMap (material.map) requires repeat.set updates, all other maps follow
  as long as wrapT and wrapS as set as THREE.RepeatWrapping.

  The size of the cube is unknown in js for the morph is calculated by the GPU.
  Refer to <a href="https://stackoverflow.com/questions/36461699/three-js-get-updated-vertices-with-morph-targets" target="_blank">this post</a> for a way to do it js side.
  Here the value of morphTargetInfluences was used to determine final size.

  This cube primitive geometry normally has 1 material/UV map repeated for each face.
  So to make face pairs repetitions independent, material has been cloned 3 times and 
  applied to faces accordingly.
  Order of faces is highly geometry dependent!!

  With the view of applying this repeting behaviour to materials that are uniquely mapped to 
  geometries, it would be great to create a shader pass that repeats the texture indefinetely over
  the size of the geometry, maybe using some uniform size as texture unit.
  `, 0xffffff)
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
  let geometry = new THREE.BoxGeometry(1, 1, 1)
  const morphWidthGeometry = geometry.clone()
  const morphHeightGeometry = geometry.clone()
  const morphDepthGeometry = geometry.clone()

  morphWidthGeometry.applyMatrix(new THREE.Matrix4().makeScale(2, 1, 1))
  morphHeightGeometry.applyMatrix(new THREE.Matrix4().makeScale(1, 2, 1))
  morphDepthGeometry.applyMatrix(new THREE.Matrix4().makeScale(1, 1, 2))

  geometry.morphTargets.push({ name: 'width', vertices: morphWidthGeometry.vertices })
  geometry.morphTargets.push({ name: 'height', vertices: morphHeightGeometry.vertices })
  geometry.morphTargets.push({ name: 'depth', vertices: morphDepthGeometry.vertices })

  geometry = new THREE.BufferGeometry().fromGeometry(geometry)

  
  function getMaterial(name, color) {
    const tex = textureLoader('./assets/wood/Wood_Planks_009_COLOR.jpg')
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    // tex.repeat.set(.5,.5)
    // tex.offset.set(0,.2)
    // const tex = textureLoader('./assets/textures/transp.png')
    const norm = textureLoader('./assets/wood/Wood_Planks_009_NORM.jpg')
    const disp = textureLoader('./assets/wood/Wood_Planks_009_DISP.png')
    const ao = textureLoader('./assets/wood/Wood_Planks_009_OCC.jpg');
    //const rough = textureLoader('./assets/wood/Wood_Planks_009_ROUGH.jpg');
  
    [tex, norm, disp, ao].map(map => {
      map.wrapS = map.wrapT = THREE.RepeatWrapping
    })

    const material = new THREE.MeshPhongMaterial({
      morphTargets: true,
      map: tex,
      normalMap: norm,
      aoMap: ao,
      // displacementMap: disp,
      name,
      color
    })

    return material
  }

  const matFront = getMaterial('front', 0xffaaaa)
  const matSide = getMaterial('side', 0xaaffaa)
  const matTop = getMaterial('top', 0xaaaaff)

  const materials = [
    matSide, // right
    matSide, // left
    matTop, // top
    matTop, // bottom
    matFront, // front 
    matFront // back
  ]
  const faceMaterialIndexDictionary = {
    'side': [0],
    'top': [2],
    'front': [4]
  }
  morphMaterialDictionary = {
    width: [{
      materialIndeces: [...faceMaterialIndexDictionary.front, ...faceMaterialIndexDictionary.top],
      repeat: 'x'
    }],
    height: [{
      materialIndeces: [...faceMaterialIndexDictionary.front, ...faceMaterialIndexDictionary.side],
      repeat: 'y'
    }],
    depth: [{
      materialIndeces: [...faceMaterialIndexDictionary.top],
      repeat: 'y'
    },
    {
      materialIndeces: [...faceMaterialIndexDictionary.side],
      repeat: 'x'
    }]

  }
  mesh = new THREE.Mesh(geometry, materials)

  scene.add(mesh)
}
function initGui() {
  const influences = {}
  for (let [morphName, idx] of Object.entries(mesh.morphTargetDictionary)) {
    influences[morphName] = mesh.morphTargetInfluences[idx]
    gui.add(influences, morphName, 0, 1, 0.01).onChange(val => {
      mesh.morphTargetInfluences[idx] = val
    })
  }
  gui.open()
}
function initHelpers() {
  const gridHelper = new THREE.GridHelper(10, 20)
  gridHelper.rotation.x = Math.PI / 2
  scene.add(gridHelper)
}
function update() {
  for (let [morphName, idx] of Object.entries(mesh.morphTargetDictionary)) {
    const influence = mesh.morphTargetInfluences[idx]
    const tweaks = morphMaterialDictionary[morphName]
    tweaks.map(tweak => {
      tweak.materialIndeces.map(matIdx => {
        mesh.material[matIdx].map.repeat[tweak.repeat] = 1 + influence
      })
    })
  }
  // mesh.material.map.repeat.set(
  //   1 + mesh.morphTargetInfluences[mesh.morphTargetDictionary.width],
  //   1 + mesh.morphTargetInfluences[mesh.morphTargetDictionary.height]
  // )


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