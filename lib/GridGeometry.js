const THREE = require('three')

module.exports = class GridGeometry {
  static SHELF_ORIENTATION = {
    H: 'horizontal',
    V: 'vertical',
  }
  constructor(rows, cols, depth = 1, gutter = 1, thickness = .05) {
    this._rows = rows
    this._cols = cols
    this._depth = depth
    this._gutter = gutter
    this._thickness = thickness
    this._group = new THREE.Group()
    this._shelfH
    this._shelfV
    this._shelfHWidth = (this._thickness + this._gutter) * this._cols + this._thickness
    this._shelfVHeight = (this._thickness + this._gutter) * this._rows + this._thickness
    this._shelfMaterial
    return this.getGrid()
  }
  getGrid() {
    const groupV = new THREE.Group() 
    groupV.name = 'groupV'
    const groupH = new THREE.Group() 
    groupH.name = 'groupH'
    this._shelfH = this.getShelfGeometry(GridGeometry.SHELF_ORIENTATION.H)
    this._shelfV = this.getShelfGeometry(GridGeometry.SHELF_ORIENTATION.V)
    this._shelfMaterial = this.getShelfMaterial()
    const halfWidth = this._shelfHWidth / 2
    const halfHeight = this._shelfVHeight / 2
    // debugger
    for (let i = 0; i < this._rows + 1; i++) {
      const shelfH = new THREE.Mesh(this._shelfH, this._shelfMaterial)
      shelfH.position.set(
        0,
        i * (this._thickness + this._gutter),
        0)
      shelfH.name = 'shelfH_' + i
      groupH.add(shelfH)
    }
    for (let i = 0; i < this._cols + 1; i++) {
      const shelfV = new THREE.Mesh(this._shelfV, this._shelfMaterial)
      shelfV.position.set(
        i * (this._thickness + this._gutter),
        0,
        0
      )
      shelfV.name = 'shelfV_' + i
      groupV.add(shelfV)
    }
    this._group.add(groupV) 
    this._group.add(groupH) 
    // center shelves
    const dx = new THREE.Box3().setFromObject(groupV).getCenter(new THREE.Vector3()).x
    const dy = new THREE.Box3().setFromObject(groupH).getCenter(new THREE.Vector3()).y
    groupV.position.x = -dx
    groupH.position.y = -dy
    return this._group
  }
  getShelfGeometry(orientation) {
    let width, height
    const depth = this._depth
    if (orientation === GridGeometry.SHELF_ORIENTATION.H) {
      width = this._shelfHWidth
      height = this._thickness
    } else if (orientation === GridGeometry.SHELF_ORIENTATION.V) {
      width = this._thickness
      height = this._shelfVHeight
    }
    return new THREE.BoxBufferGeometry(width, height, this._depth)
  }
  getShelfMaterial() {
    return new THREE.MeshStandardMaterial({
      color: 0x69d4ff ,
      metalness: .8,
      roughness: .15
    })
  }
}


