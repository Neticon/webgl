const jsUtil = require('../lib/js-utils')
const THREE = require('three')
require('three-examples/controls/OrbitControls')
require('three-examples/postprocessing/EffectComposer')
require('three-examples/postprocessing/RenderPass')
require('three-examples/postprocessing/ShaderPass')
require('three-examples/shaders/CopyShader')
require('three-examples/shaders/VignetteShader')
require('three-examples/shaders/SepiaShader')
require('three-examples/shaders/MirrorShader')
require('three-examples/shaders/FilmShader')
require('three-examples/shaders/PixelShader')
require('three-examples/shaders/BlendShader')


function init(diffuseMap) {
  const scene = new THREE.Scene()
  const renderer = new THREE.WebGLRenderer({ antialias: true, precision: 'highp' })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0xababab)
  renderer.shadowMapEnabled = true
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000)
  const orbitControls = new THREE.OrbitControls(camera, renderer.domElement)

  const light = new THREE.PointLight({ color: 0xffffff })
  light.name = 'light'
  const sphere = getSphere(.1, 32, 0xffffff)
  sphere.name = 'sphere'
  light.position.set(-1, 1, 1)
  light.castShadow = true
  light.add(sphere)
  scene.add(light)

  const cube = getCube()
  cube.name = 'cube'
  // cube.material.color.set(0xffffff)
  // cube.material.side = THREE.DoubleSide
  scene.add(cube)

  const composer = new THREE.EffectComposer(renderer)
  const renderPass = new THREE.RenderPass(scene, camera)
  const copyPass = new THREE.ShaderPass(THREE.CopyShader)
  copyPass.renderToScreen = true

  const sepiaPass = new THREE.ShaderPass(THREE.SepiaShader)
  const vignettePass = new THREE.ShaderPass(THREE.VignetteShader)
  const mirrorPass = new THREE.ShaderPass(THREE.MirrorShader)
  mirrorPass.uniforms['side'].value = 2
  const filmPass = new THREE.ShaderPass(THREE.FilmShader)

  composer.addPass(renderPass)
  composer.addPass(vignettePass)
  // composer.addPass(sepiaPass)
  // composer.addPass(mirrorPass)
  // composer.addPass(filmPass)
  composer.addPass(copyPass)

  camera.position.z = 4
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  render()

  function render() {
    requestAnimationFrame(render)
    cube.rotation.x += .005
    cube.rotation.y += .005
    //renderer.render(scene, camera)
    composer.render()
  }


  function getCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = getShaderMaterial(THREE.PixelShader, {
      tDiffuse: { value: diffuseMap },
      resolution: {value: [40,40]}
    })//new THREE.MeshPhongMaterial()
    const mesh = new THREE.Mesh(geometry, material)
    return mesh
  }

  function getSphere(radius, vertices, color) {
    const geometry = new THREE.SphereGeometry(radius, vertices, vertices)
    const material = new THREE.MeshBasicMaterial({ color })
    const mesh = new THREE.Mesh(geometry, material)
    return mesh
  }

  function getShaderMaterial(shader, uniforms) {
    const uni = Object.assign({}, shader.uniforms, uniforms)
    const material = new THREE.ShaderMaterial({
      uniforms: uni,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    })
    return material
  }

  window.__scene = scene
  window.__renderer = renderer
  window.THREE = THREE
}

new THREE.TextureLoader().load('./assets/textures/scratch.jpg', function (mat) {
  init(mat)
})