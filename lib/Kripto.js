const _Math = {
  CMS2UNITS: 1 / 25,
  get UNITS2CMS() {
    return 1 / this.CMS2UNITS
  },
  cmsToUnits: cm => cm * _Math.CMS2UNITS,
  unitsToCms: units => units * _Math.UNITS2CMS,
}
const konsts = {
  VMODULE_UPRIGHT_HOLEPLUSSPAN: 6,

}
const enums = {
  CMODULE_IDLE: 0,
  CMODULE_BUSY: 1,
  CMODULE_LOCKED: 2
}
/**
 * @type {Kripto.VerticalModule}
 * @param {Kripto.type} type
 * @param {number} height
 * @param {number} width
 */
class VerticalModule {
  type = null
  height = null
  width = null
  children = []
  constructor(type, width, height) {
    this.type = type
    this.height = height
    this.width = width
    this.init()
  }
  init() {
    const nContentModules = Math.floor(this.height / konsts.VMODULE_UPRIGHT_HOLEPLUSSPAN)
    for (let i = 0; i < nContentModules; i++) {
      const opts = {
        type: this.type,
        parent: this,
        idx: i
      }
      const contentModule = new ContentModule(
        this.width,
        konsts.VMODULE_UPRIGHT_HOLEPLUSSPAN,
        opts
      )
      this.children.push(contentModule)
    }
  }
  canContentModuleFitObject(contentModule, kObject) {
    // check if content module is free
    // check kObject dimensions
    // get how many contentModules kObject takes.
    // get n contentModules after current
    // check if each is free
    // return boolean
  }
  getNextContentModule(contentModule) {
    return this.children[contentModule.idx + 1]
  }
  getPrevContentModule(contentModule) {
    return this.children[contentModule.idx - 1]
  }
}
/**
 * @type {Kripto.HorizontalModule}
 * @param {Kripto.type} type
 * @param {number} height
 * @param {number} width
 */
class HorizontalModule {
  type = null
  height = null
  width = null
  constructor(type, width, height) {
    this.type = type
    this.height = height
    this.width = width
  }
}


/**
 * @type {Kripto.ContentModule}
 * @param {Kripto.type} type
 * @param {number} height
 * @param {number} width
 */
class ContentModule {
  width = null
  height = null
  type = null
  parent = null
  children = []
  status = enums.CMODULE_IDLE
  idx = null
  constructor(width, height, opts) {
    this.height = height
    this.width = width
    this.type = opts.type
    this.parent = opts.parent
    this.idx = opts.idx
  }
  get hasContent() {
    return this.status === enums.CMODULE_BUSY
  }
  get next() {
    return this.parent.getNextContentModule(this)
  }
  get prev() {
    return this.parent.getPrevContentModule(this)
  }
  canFitKObject(kObject) {
    return this.parent.canContentModuleFitObject(this, kObject)
  }
}

/**
 * @type {Kripto.GridModule}
 * @param {Kripto.type} type
 * @param {number} height
 * @param {number} width
 */
class GridModule {
  type = null
  height = null
  width = null
  children = []
  constructor(type, width, height) {
    this.type = type
    this.height = height
    this.width = width
  }
}
module.exports = {
  Math: _Math,
  ...konsts,
  GridModule,
  VerticalModule,
  HorizontalModule,
  ContentModule
}
