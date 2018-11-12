// https://sketchfab.com/models/56a3e10a73924843949ae7a9800c97c7?ref=related#download
const THREE = require('three')
require('../lib/inflate.min.js')
require('three-examples/loaders/FBXLoader')
require('three-examples/loaders/GLTFLoader')
require('three-examples/controls/OrbitControls')
const dat = require('dat.gui')
const gui = new dat.GUI()

const { innerWidth: W, innerHeight: H } = window
const renderer = new THREE.WebGLRenderer({ antialias: true })
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, W / H, 0.001)
const controls = new THREE.OrbitControls(camera, renderer.domElement)
const clock = new THREE.Clock()

let mixer
/**
 * @type {{[clipName:string]:THREE.AnimationAction}}
 */
const actions = {}

// const file = './assets/animation/sphere_out/sphere.gltf'
// const file = './assets/animation/Samba Dancing.fbx'
// const file = './assets/animation/Mesh_AnimationLayer.fbx'
// const file = './assets/animation/test_deform.fbx'
// const file = './assets/animation/TestAnimation2.fbx'
// const file = './assets/animation/TestAnimation5.dae'
// const file = './assets/animation/_out8_out/_out8.gltf'
// const file = './assets/animation/_out/.gltf'
const file = './assets/animation/Test.dae'

init()
animate()

function init() {
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(W, H)
  renderer.setClearColor(0x606060)
  document.body.appendChild(renderer.domElement)

  camera.position.set(0, 0, 10)

  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  scene.add(directionalLight)

  const gridHelper = new THREE.GridHelper(10,20)
  gridHelper.rotation.x = Math.PI / 2
  scene.add(gridHelper)

  if (file.split('.').slice(-1).toString() === 'fbx') {
    new THREE.FBXLoader().load(file, onLoad, null, console.log)
  } else {
    new THREE.GLTFLoader().load(file, onLoad, null, console.log)

  }
  // new THREE.FBXLoader().load('./assets/animation/raptor_fbx/scene.fbx', onLoad, null, console.log)
}
function fitCamera(object) {
  const bbox = new THREE.Box3().setFromObject(object)
  camera.position.z = bbox.max.z * 6
  camera.lookAt(object)
}
function onLoad(object) {
  console.log(object)
  let _scene = object.scene ? object.scene : object
  mixer = new THREE.AnimationMixer(_scene)
  const animations = object.animations
  for (const animation of animations || []) {
    actions[animation.name] = mixer.clipAction(animation)
    actions[animation.name].paused = true
    actions[animation.name].play()
  }

  scene.add(_scene)
  fitCamera(_scene)
  setGui()
}

function setGui() {
  for (const action of Object.values(actions)) {
    addActionControl(action)
  }
}

function animate() {
  if (mixer) {
    mixer.update(clock.getDelta())
  }
  controls.update()
  render()
  requestAnimationFrame(animate)
}
function render() {
  renderer.render(scene, camera)
}

// creates gui folder with tests / examples for the action API
/**
 * @param {THREE.AnimationAction} action 
 */
function addActionControl(action) {
  const clip = action.getClip()
  const mixer = action.getMixer()
  const folder = gui.addFolder("Clip '" + clip.name + "'")

  const API = {
    'play()': function play() {
      action.play();
    },
    'stop()': function () {
      action.stop();
    },
    'reset()': function () {
      action.reset();
    },
    get 'time ='() {
      return action !== null ? action.time : 0;
    },
    set 'time ='(value) {
      action.time = value;
    },
    get 'keyFrame ='() {
      return action !== null ? action.time : 0;
    },
    set 'keyFrame ='(value) {
      action.time = value
    },
    get 'paused ='() {
      return action !== null && action.paused;
    },
    set 'paused ='(value) {
      action.paused = value;
    },
    get 'enabled ='() {
      return action !== null && action.enabled;
    },
    set 'enabled ='(value) {
      action.enabled = value;
    },
    get 'clamp ='() {
      return action !== null ? action.clampWhenFinished : false;
    },
    set 'clamp ='(value) {
      action.clampWhenFinished = value;
    },
    get 'isRunning() ='() {
      return action !== null && action.isRunning();
    },
    set 'isRunning() ='(value) {
      alert("Read only - this is the result of a method.");
    },
    'play delayed': function () {
      action.startAt(mixer.time + 0.5).play();
    },
    get 'weight ='() {
      return action !== null ? action.weight : 1;
    },
    set 'weight ='(value) {
      action.weight = value;
    },
    get 'eff. weight'() {
      return action !== null ? action.getEffectiveWeight() : 1;
    },
    set 'eff. weight'(value) {
      action.setEffectiveWeight(value);
    },
    'fade in': function () {
      action.reset().fadeIn(0.25).play();
    },
    'fade out': function () {
      action.fadeOut(0.25).play();
    },
    get 'timeScale ='() {
      return (action !== null) ? action.timeScale : 1;
    },
    set 'timeScale ='(value) {
      action.timeScale = value;
    },
    get 'eff.T.Scale'() {
      return (action !== null) ? action.getEffectiveTimeScale() : 1;
    },
    set 'eff.T.Scale'(value) {
      action.setEffectiveTimeScale(value);
    },
    'time warp': function () {
      var timeScaleNow = action.getEffectiveTimeScale();
      var destTimeScale = timeScaleNow > 0 ? -1 : 1;
      action.warp(timeScaleNow, destTimeScale, 4).play();
    },
    get 'loop mode'() {
      return action !== null ? action.loop : THREE.LoopRepeat;
    },
    set 'loop mode'(value) {
      action.loop = + value;
    },
    get 'repetitions'() {
      return action !== null ? action.repetitions : Infinity;
    },
    set 'repetitions'(value) {
      action.repetitions = + value;
    }
  }

  folder.add(API, 'play()');
  folder.add(API, 'stop()');
  folder.add(API, 'reset()');
  folder.add(API, 'time =', 0, clip.duration).listen();
  folder.add(API, 'keyFrame =', Object.values((action.getClip().tracks[0] || {times:0}).times))
  folder.add(API, 'paused =').listen();
  folder.add(API, 'enabled =').listen();
  folder.add(API, 'clamp =');
  folder.add(API, 'isRunning() =').listen();
  folder.add(API, 'play delayed');
  folder.add(API, 'weight =', 0, 1).listen();
  folder.add(API, 'eff. weight', 0, 1).listen();
  folder.add(API, 'fade in');
  folder.add(API, 'fade out');
  folder.add(API, 'timeScale =', -2, 2).listen();
  folder.add(API, 'eff.T.Scale', -2, 2).listen();
  folder.add(API, 'time warp');
  folder.add(API, 'loop mode', {
    "LoopOnce": THREE.LoopOnce,
    "LoopRepeat": THREE.LoopRepeat,
    "LoopPingPong": THREE.LoopPingPong
  });
  folder.add(API, 'repetitions', 0, Infinity);
};

window.__scene = scene
window.__renderer = renderer
window.THREE = THREE