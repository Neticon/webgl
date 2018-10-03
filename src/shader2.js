const jsUtil = require('../lib/js-utils')
const THREE = require('three')
require('imports-loader?THREE=three!three-examples/controls/OrbitControls')
require('imports-loader?THREE=three!three-examples/postprocessing/EffectComposer')
require('imports-loader?THREE=three!three-examples/postprocessing/RenderPass')
require('imports-loader?THREE=three!three-examples/postprocessing/ShaderPass')
require('imports-loader?THREE=three!three-examples/shaders/CopyShader')
require('imports-loader?THREE=three!three-examples/shaders/VignetteShader')
require('imports-loader?THREE=three!three-examples/shaders/SepiaShader')

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColor(0x606060)
document.body.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(55, window.innerWidth/ window.innerHeight, 1, 1000)
camera.position.set(0,0,3)

const orbitControls = new THREE.OrbitControls(camera, renderer.domElement)


const cubeGeometry = new THREE.BoxGeometry(1,1,1)
const cubeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff})
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)

scene.add(cubeMesh)

const composer = new THREE.EffectComposer(renderer)
const renderPass= new THREE.RenderPass(scene, camera)
const copyPass = new THREE.ShaderPass(THREE.CopyShader)
const vignettePass = new THREE.ShaderPass(THREE.VignetteShader)
vignettePass.uniforms['darkness'].value = 2
copyPass.renderToScreen = true
composer.addPass(renderPass)
composer.addPass(vignettePass)
composer.addPass(copyPass)

render()

function render(){
  requestAnimationFrame(render)
  orbitControls.update()
  cubeMesh.rotation.y += 0.005
  cubeMesh.rotation.x += 0.005
  //renderer.render(scene, camera)
  composer.render()
}

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE