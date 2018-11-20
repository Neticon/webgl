try{
  const THREE = require('three')
require('three-examples/controls/OrbitControls')
// require('three-examples/controls/DragControls')
require('imports-loader?THREE=three!../lib/DragDropControls')
// require('../lib/DragControls')
const { addDescription } = require('../lib/js-utils')
const { getManyRandom } = require('../lib/three-utils')
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
/** @type {THREE.DragDropControls} */
let dragDropControls
/** @type {THREE.Group} */
const draggables = new THREE.Group()
/** @type {THREE.Group} */
const droppables = new THREE.Group()

const dropRegions = []

const guiParams = {
  cubes: 10,
  setCursor: true,
  fixDragPlane: true,
  addPlaneHelper: true,
  addArrowHelper: true
}


init()

function init() {
  initDesc()
  initScene()
  initRenderer()
  initCamera()
  initLights()
  initControls()
  initMesh(guiParams.cubes)
  initDropRegions()
  initHelpers()
  initGui()
  bindWindowResize()

  renderer.setAnimationLoop(() => {
    update()
    render()
  })
}

function initDesc() {
  addDescription(`This is a better version of the {fn{link(/?entry=dragging,dragging test)}} {{nbsp}}
  Rewrote THREE.DragControls into THREE.DragDropControls.

  Drop regions states are {fn{square(#ffffff)}} idle, {fn{square(#0000ff)}} full, {fn{square(#00ff00)}} available, {fn{square(#ff0000)}} unavailable.

  Problems addressed:
  No need to instanciate 2 DragControls since 1 instance of DragDropControls does all.
  'dropObjects' parameter is an array of dropRegions
  Drag plane can now be forced to be parallel to the scene origin plane. Which makes moving objects
  way more intuitive. (fixDragPlane option)
  
  Additional convenience:
  Setting cursor states is now optional
  Added optional
  - drag plane helper (plane over which objects move)
  - and arrow helper (ray casted from center of dragged objects which may or may not interpolate a drop region)
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
  camera.position.set(0, 0, 15)
  
}
function initControls() {
  controls = new THREE.OrbitControls(camera, renderer.domElement)
  dragDropControls = new THREE.DragDropControls(draggables.children, camera, renderer.domElement, droppables.children, 
    {
      scene: scene, 
      setCursor: true,
      addPlaneHelper: true, 
      addArrowHelper: true, 
    })

  dragDropControls.addEventListener('dragstart', e => {
    controls.enabled = false
    e.object.material.transparent = true
    e.object.material.opacity = .5
  })
  dragDropControls.addEventListener('hoveronDrop',e =>{
    const { object, objectDrop} = e
    const dropRegion = dropRegions.find(d=>d.plane === e.objectDrop)
    dropRegion.onHoverWhileDrag(object)
  })
  dragDropControls.addEventListener('hoveroffDrop',e =>{
    const { object, objectDrop} = e
    const dropRegion = dropRegions.find(d=>d.plane === e.objectDrop)
    dropRegion.onHoverOffWhileDrag(object)
  })
  dragDropControls.addEventListener('dragend', e => {
    const { object, objectDrop} = e
    e.object.material.transparent = false
    if(objectDrop){
      const dropRegion = dropRegions.find(d=>d.plane === e.objectDrop)
      dropRegion.onTryDrop(object)
    }
    controls.enabled = true
  })
}
function initMesh(n) {
  dropRegions.map(d=>d.clear())
  scene.remove(draggables)
  const group = getManyRandom(getMesh(), n, [[-4, 0], [0, 4], [1, 5]])
  group.children.map(object => {
    object.geometry.computeBoundingBox()
    object.userData.size = object.geometry.boundingBox.getSize(new THREE.Vector3()).clone()
    object.userData.position = object.position.clone()
  })
  draggables.children.splice(0, Infinity, ...group.children)
  scene.add(draggables)

  function getMesh() {
    const geo = new THREE.BoxBufferGeometry(1, 1, 1)
    const material = new THREE.MeshPhongMaterial()
    return new THREE.Mesh(geo, material)
  }
}
function initDropRegions() {
  const params = [
    [[2, 1],
    [1, -1, 0]],
    [[2.5, 2],
    [1.25, -4, 0]],
    [[2, 4],
    [4, -2, 0]],
  ]
  for (let region of params) {
    const [size, position] = region
    const dropRegion = getDropRegion(...size)
    dropRegion.plane.position.set(...position)
    dropRegions.push(dropRegion)
    droppables.add(dropRegion.plane)
  }
  scene.add(droppables)
}
function getPlane(w, h, color) {
  const geo = new THREE.PlaneBufferGeometry(w, h)
  const mat = new THREE.MeshLambertMaterial({ color: color })
  const mesh = new THREE.Mesh(geo, mat)
  return mesh
}
function getDropRegion(w, h) {

  const region = {
    w, h,
    plane: getPlane(w, h, 0xffffff),
    object3D: [],
    object3Dhover: null,
    STATES: { idle: 0, full: 1, available: 2, unavailable: 4 },
    _state: null,
    get hasObject() {
      return !!this.object3D.length
    },
    get state() {
      if (!this.object3Dhover) {
        if (this.hasObject) {
          this._state = this.STATES.full
        } else {
          this._state = this.STATES.idle
        }
      } else {
        // object hovering on region
        if (this.hasObject) {
          this._state = this.STATES.unavailable
        } else {
          if (
            this.w >= this.object3Dhover.userData.size.x &&
            this.h >= this.object3Dhover.userData.size.y
          ) {
            this._state = this.STATES.available
          } else {
            this._state = this.STATES.unavailable
          }
        }
      }
      return this._state
    },
    init() {
      this.plane.userData.dropRegion = this
    },
    clear(){
      if(this.object3D.length){
        this.object3D.splice(0)
      }
    },
    onHoverWhileDrag(object) {
      this.object3Dhover = object
      if (this.object3Dhover === this.object3D[0]) {
        this.clear()
      }
    },
    onHoverOffWhileDrag(object) {
      if (object === this.object3D[0]) {
        this.clear()
      }
      this.object3Dhover = null
    },
    onTryDrop(object) {
      if (this.state === this.STATES.available) {
        this.onDrop(object)
      } else {
        this.onPreventDrop(object)
      }
      this.object3Dhover = null
    },
    onDrop(object) {
      this.object3D.push(object)
      this.snap()
    },
    onPreventDrop(object) {
      object.position.copy(object.userData.position)
    },
    snap() {
      this.object3D[0].position.copy(this.plane.position)
      this.object3D[0].position.z += this.object3D[0].userData.size.z / 2
    },
    update() {
      this.updateColor()
    },
    updateColor() {
      let color
      switch (this.state) {
        case this.STATES.idle:
          color = 0xffffff
          break
        case this.STATES.full:
          color = 0x0000ff
          break
        case this.STATES.available:
          color = 0x00ff00
          break
        case this.STATES.unavailable:
          color = 0xff0000
          break
      }
      this.plane.material.color = new THREE.Color(color)
    }
  }
  region.init()
  return region
}
function initGui() {
  
  gui.open()
  gui.add(guiParams, 'cubes', 1, 100, 1).onChange(n => { initMesh(n) })
  gui.add(guiParams, 'setCursor').onChange(v=>{dragDropControls.setOptions({setCursor:v})})
  gui.add(guiParams, 'fixDragPlane').onChange(v=>{dragDropControls.setOptions({fixDragPlane:v})})
  gui.add(guiParams, 'addPlaneHelper').onChange(v=>{dragDropControls.setOptions({addPlaneHelper:v})})
  gui.add(guiParams, 'addArrowHelper').onChange(v=>{dragDropControls.setOptions({addArrowHelper:v})})
}
function initHelpers() {
  const gridHelper = new THREE.GridHelper(10, 20)
  gridHelper.rotation.x = Math.PI / 2
  scene.add(gridHelper)
}
function update() {
  dropRegions.map(dropRegion => dropRegion.update())
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

window.__dragDropControls = dragDrpControls
} catch(e){
  alert(e)
}