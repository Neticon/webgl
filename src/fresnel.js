const THREE = require('three')
const OrbitControls = require('three-examples/controls/OrbitControls')
const fresnel = require('three-examples/shaders/FresnelShader')
const { ObjRotator, object3DGrid, randColor } = require('../lib/three-utils')
const { addDescription } = require('../lib/js-utils')

const dat = require('dat.gui')


addDescription(`__fresnel__

here the sphere uses ShaderMaterial with a modified Fresnel shader.
tCube uniform is the output of the cubeCamera placed in the center of the sphere.
this gives both reflection and refraction.
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
const cubeCamera = new THREE.CubeCamera(.5, 5, 2 ** 10)
//cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter
// cubeCamera.renderTarget.texture.flipY = false

const shader = THREE.FresnelShader
const uniforms = THREE.UniformsUtils.clone(shader.uniforms)
uniforms['tCube'].value = cubeCamera.renderTarget.texture

// modified fragment_shader here, removing x flipping effect (-vReflect.x => vReflect.x)
// and removing the rgb split business
const fragmentShader = [
  "uniform samplerCube tCube;",

  "varying vec3 vReflect;",
  "varying vec3 vRefract[3];",
  "varying float vReflectionFactor;",

  "void main() {",

  "vec4 reflectedColor = textureCube( tCube, vec3( vReflect.x, vReflect.yz ) );",
  "vec4 refractedColor = vec4( 1.0 );",

  "// removed rgb soap bubble effect",
  "refractedColor = textureCube( tCube, vec3( vRefract[0].x, vRefract[0].yz ) );",
  "/*",
  "refractedColor.r = textureCube( tCube, vec3( vRefract[0].x, vRefract[0].yz ) ).r;",
  "refractedColor.g = textureCube( tCube, vec3( vRefract[1].x, vRefract[1].yz ) ).g;",
  "refractedColor.b = textureCube( tCube, vec3( vRefract[2].x, vRefract[2].yz ) ).b;",
  "*/",
  "gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",

  "}"
].join("\n")

const sphereGeo = new THREE.SphereGeometry(1, 64, 64)
// const sphereGeo = new THREE.TorusKnotGeometry(.7,.2,64,64)
const sphereMat = new THREE.ShaderMaterial({
  vertexShader: shader.vertexShader,
  fragmentShader,
  uniforms,
  side: THREE.FrontSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,

})
const sphere = new THREE.Mesh(sphereGeo, sphereMat)
sphere.receiveShadow = true
sphere.castShadow = false
//sphere.position.y = 3
scene.add(sphere)

const cubeGeo = new THREE.CubeGeometry(1, 1, 1)
const cubeMat = new THREE.MeshPhongMaterial({ color: 0xababab })
const cube = new THREE.Mesh(cubeGeo, cubeMat)
cube.castShadow = true
cube.receiveShadow = true
const cubeGrid = object3DGrid(cube, 3, 1)
cubeGrid.children
  .map((cube, idx) => {
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

setGui()

requestAnimationFrame(
  function render() {
    controls.update()
    sphere.visible = false
    cubeCamera.update(renderer, scene)
    sphere.visible = true
    renderer.render(scene, camera)

    requestAnimationFrame(render)
  }
)

function setGui() {
  const gui = new dat.GUI()
  const $cubeCamera = gui.addFolder('cubecamera')
  $cubeCamera.open()
  $cubeCamera.add(sphere.position, 'x', -10, 10).onChange(updateCubeCameraPosition)
  $cubeCamera.add(sphere.position, 'y', -10, 10).onChange(updateCubeCameraPosition)
  $cubeCamera.add(sphere.position, 'z', -10, 10).onChange(updateCubeCameraPosition)

  const $uniforms = gui.addFolder('uniforms')
  $uniforms.open()
  $uniforms.add(uniforms.mRefractionRatio, 'value', 0, 5, .1).name('mRefractionRation')
  $uniforms.add(uniforms.mFresnelBias, 'value', 0, 5, .1).name('mFresnelBias')
  $uniforms.add(uniforms.mFresnelPower, 'value', 0, 5, .1).name('mFresnelPower')
  $uniforms.add(uniforms.mFresnelScale, 'value', 0, 5, .1).name('mFresnelScale')

  function updateCubeCameraPosition() {
    cubeCamera.position.copy(sphere.position)
  }
}

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE