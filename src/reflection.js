const THREE = require('three')
const OrbitControls = require('three-examples/controls/OrbitControls')
const { ObjRotator, object3DGrid, randColor } = require('../lib/three-utils')
const { addDescription } = require('../lib/js-utils')

addDescription(`__reflection__

6 perspectiveCameras placed in the center of the sphere render to a texture 
which is used as envMap for the center sphere material.
Notice how material is transparent but there is no refraction whatsoever.
-----
use mouse to rotate scene.
use x, y, z [+ ctrlKey] to rotate cubes around axes.`)

const { innerWidth: W, innerHeight: H } = window
const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ antialias: true })
const camera = new THREE.PerspectiveCamera(45, W / H, 1, 100)
const controls = new THREE.OrbitControls(camera, renderer.domElement)

renderer.setClearColor(0x404040)
renderer.setSize(W, H)
renderer.shadowMap.enabled = true
// renderer.shadowMap.bias = 0.1
renderer.shadowMap.width = 2048
renderer.shadowMap.height = 2048
document.body.appendChild(renderer.domElement)

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.shadow = new THREE.DirectionalLightShadow(camera)
directionalLight.castShadow = true
directionalLight.position.y = 5
scene.add(directionalLight)

const lightHelper = new THREE.DirectionalLightHelper(directionalLight)
// scene.add(lightHelper)
const cubeCamera = new THREE.CubeCamera(0.01, 1000, 2 ** 9)
cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter
cubeCamera.renderTarget.texture.mapping = THREE.CubeReflectionMapping // same as UVMapping

const sphereGeo = new THREE.SphereGeometry(1, 64, 64)
const sphereMat = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  specular: 0xffffff,
  shininess: 100,
  envMap: cubeCamera.renderTarget.texture,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
})
const sphere = new THREE.Mesh(sphereGeo, sphereMat)
sphere.receiveShadow = true
sphere.castShadow = false
scene.add(sphere)

const cubeGeo = new THREE.CubeGeometry(1, 1, 1)
const cubeMat = new THREE.MeshPhongMaterial({ color: 0xababab })
const cube = new THREE.Mesh(cubeGeo, cubeMat)
cube.castShadow = true
cube.receiveShadow = true
const cubeGrid = object3DGrid(cube, 3, 1)
cubeGrid.children.map((cube, idx) => {
  const mat = cube.material.clone()
  mat.color.set(randColor())
  cube.material = mat
  if (idx === (cubeGrid.children.length / 2 | 0)) {
    cube.visible = false
  }
})
cubeGrid.rotation.x = THREE.Math.degToRad(45)
new ObjRotator(cubeGrid)
scene.add(cubeGrid)

cubeCamera.position.copy(sphere.position)
scene.add(cubeCamera)

directionalLight.target = sphere

camera.position.set(0, 0, 8)

requestAnimationFrame(
  function render() {
    sphere.visible = false
    controls.update()
    cubeCamera.update(renderer, scene)
    sphere.visible = true
    renderer.render(scene, camera)

    requestAnimationFrame(render)
  }
)

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE