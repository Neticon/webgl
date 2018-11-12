const THREE = require('three')
require('three/examples/js/controls/OrbitControls')
const { innerWidth: w, innerHeight: h } = window
const renderer = new THREE.WebGLRenderer({ antialias: true })
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, w / h)
const controls = new THREE.OrbitControls(camera, renderer.domElement)

const basis = 25



init()
animate()

function init() {
  renderer.setSize(w, h)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0xababab)
  document.body.appendChild(renderer.domElement)

  camera.position.set(0, 0, 5)
  camera.lookAt(new THREE.Vector3())

  const grid = new THREE.GridHelper(10, 10)
  grid.geometry.rotateX(Math.PI / 180 * 90)
  scene.add(grid)

  const group = new THREE.Group()

  const c1geo = new THREE.CubeGeometry(1, 1, 1)
  const c1mat = new THREE.MeshBasicMaterial({ color: 0x00ffff })
  const c1mesh = new THREE.Mesh(c1geo, c1mat)
  c1mesh.userData.scale = false
  c1mesh.position.x = -2
  c1mesh.position.z = .5

  const c2geo = new THREE.CubeGeometry(1, 1, 1)
  const c2mat = new THREE.MeshBasicMaterial({ color: 0xff00ff })
  const c2mesh = new THREE.Mesh(c2geo, c2mat)
  c2mesh.userData.scale = true
  c2mesh.position.x = -1

  const c3geo = new THREE.CubeGeometry(1, 1, 1)
  const c3mat = new THREE.MeshBasicMaterial({ color: 0xffff00 })
  const c3mesh = new THREE.Mesh(c3geo, c3mat)
  c3mesh.userData.scale = true
  c3mesh.position.x = 0
  c3mesh.position.z = .5

  const c4geo = new THREE.CubeGeometry(1, 1, 1)
  const c4mat = new THREE.MeshBasicMaterial({ color: 0xf0f0ff })
  const c4mesh = new THREE.Mesh(c4geo, c4mat)
  c4mesh.userData.scale = true
  c4mesh.position.x = 1

  const c5geo = new THREE.CubeGeometry(1, 1, 1)
  const c5mat = new THREE.MeshBasicMaterial({ color: 0xf00f00 })
  const c5mesh = new THREE.Mesh(c5geo, c5mat)
  c5mesh.userData.scale = false
  c5mesh.position.x = 2
  c5mesh.position.z = .5

  group.add(c1mesh)
  group.add(c2mesh)
  group.add(c3mesh)
  group.add(c4mesh)
  group.add(c5mesh)

  scene.add(group)

}
function animate(time) {
  render()
  requestAnimationFrame(animate)
}
function render() {
  controls.update()
  renderer.render(scene, camera)
}

function resize(g, amount) {
  g.scale.set(amount, 1, 1)
  g.children.map(obj => {
    if (obj.userData.scale === false) {
      desize(obj, g, amount)
    }
  })

}
/**
 * 
 * @param {THREE.Object3D} obj 
 * @param {number} amount 
 */
function desize(obj, g, amount) {
  //const bbox1 = new THREE.Box3().setFromObject(obj)
  // const size1 = bbox1.getSize(new THREE.Vector3())
  // console.log(size1)
  // obj.scale.set(obj.scale.x/2, 1, 1)
  // const bbox2 = new THREE.Box3().setFromObject(obj)
  // const size2 = bbox2.getSize(new THREE.Vector3())
  // console.log(size2)

  // const dx = size1.x - size2.x
  // const tx = dx / amount / 2
  // obj.translateX(tx)

  const sign = obj.position.x < 0 ? -1 : 1
  obj.geometry.computeBoundingBox()
  const widthNow = obj.geometry.boundingBox.getSize(new THREE.Vector3()).x * obj.scale.x
  const widthThen = obj.geometry.boundingBox.getSize(new THREE.Vector3()).x * 1 / amount
  obj.scale.set(1 / amount, 1, 1)
  obj.position.x += (widthNow - widthThen) / 2 * -sign

}


window.__scene = scene
window.__renderer = renderer
window.THREE = THREE
window.resize = resize