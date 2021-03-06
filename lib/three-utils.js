const THREE = require('three')
require('three-examples/loaders/MTLLoader')
require('three-examples/loaders/OBJLoader')
const jsUtil = require('../lib/js-utils')

const texLoader = new THREE.TextureLoader();
/** 
 * 
 * @param  {string} url
 * @returns {THREE.Texture}
 * */
const textureLoader = url => texLoader.load(url)

const objLoader = new THREE.OBJLoader()
objLoader.loadP = jsUtil.promifyFn(objLoader.load.bind(objLoader), 1, 'rsv')

const mtlLoader = new THREE.MTLLoader()
mtlLoader.loadP = jsUtil.promifyFn(mtlLoader.load.bind(mtlLoader), 1, 'rsv')
mtlLoader.crossOrigin = true

const cubeTextureLoader = (() => {
  const loader = new THREE.CubeTextureLoader()
  const faces = ['px', 'nx', 'py', 'ny', 'pz', 'nz']
  return (path, extension) => {
    const urls = faces.map(face => `${path}${face}${extension}`)
    return loader.load(urls)
  }
})()

const randColor = () => new THREE.Color(Math.random() * 0xffffff)

class ObjRotator {
  /**
   * 
   * @param {THREE.Object3D} object
   * @param {number} d 
   */
  constructor(object, d) {
    this.object = object
    this.d = d || 0.05
    document.addEventListener('keydown', this.handler.bind(this))
  }
  /**
   * 
   * @param {KeyboardEvent} e 
   */
  handler(e) {
    switch (e.key) {
      case 'x':
      case 'y':
      case 'z':
        this.rotate(e.key, e.ctrlKey * -2 + 1)
        break

    }
  }
  rotate(axis, direction) {
    this.object.rotation[axis] += this.d * direction
  }
}

function KeyBinder() {
  let _instance = null
  return class KeyBinder {
    static EVENTS = {
      ALL: 'all'
    }
    constructor() {
      if (_instance !== null) {
        return _instance
      }
      _instance = this
      this.bind()
    }
    _bound = false
    _events = []
    bind() {
      if (this._bound) {
        return
      }
      document.addEventListener('keydown', this.handler)
      this._bound = true
    }
    unbind() {
      if (!this._bound) {
        return
      }
      document.removeEventListener('keydown', this.handler)
      this._bound = false
    }
    addKeys(arrEvents) {
      if (!arrEvents instanceof Array) {
        return
      }
      arrEvents.map(ev => {
        if (!this._events.includes(ev)) {
          this._events.push(ev)
        }
      })
    }
    removeKeys(arrEvents) {
      if (!arrEvents instanceof Array) {
        return
      }
      if (arrEvents.includes(KeyBinder.EVENTS.ALL)) {
        this._events.splice(0)
        return
      }
      for (let i = arrEvents.length; i-- > 0;) {
        const idx = this._events.findIndex(ev)
        if (idx) {
          this._events.splice(idx, 1)
        }
      }
    }
    handler(e) {
      console.log(e)
    }
  }
}

function object3DGrid(object3D, n, gutter) {
  const group = new THREE.Group()
  const { x: w, y: h, z: d } = new THREE.Box3()
    .setFromObject(object3D)
    .getSize(new THREE.Vector3())

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

/**
 * 
 * @param {THREE.Mesh} mesh 
 * @param {number} n 
 */
function getManyRandom(mesh, n, pRange = [[],[],[]]) {
  const p_n = 5;
   const [
    [pRx_l = -p_n, pRx_h = p_n],
    [pRy_l = -p_n, pRy_h = p_n],
    [pRz_l = -p_n, pRz_h = p_n],
  ] = pRange
  const s = () => THREE.Math.randFloat(0.5, 1.5)
  const px = () => THREE.Math.randFloat(pRx_l, pRx_h)
  const py = () => THREE.Math.randFloat(pRy_l, pRy_h)
  const pz = () => THREE.Math.randFloat(pRz_l, pRz_h)
  const group = new THREE.Group()
  for (let i = 0; i < n; i++) {
    const m = mesh.material.clone()
    const g = mesh.geometry.clone()
    m.color.set(randColor())
    g.scale(s(), s(), s())
    const _mesh = new THREE.Mesh(g, m)
    _mesh.position.set(px(), py(), pz())
    group.add(_mesh)
  }
  return group
}

module.exports = {
  textureLoader,
  cubeTextureLoader,
  objLoader,
  mtlLoader,
  KeyBinder: KeyBinder(),
  ObjRotator,
  object3DGrid,
  randColor,
  getManyRandom
}