import { Enum } from './Enum'
import * as THREE from 'three'
import { KObject } from './KObject'


export interface IBaseModule {
  width: number
  height: number
  depth: number
  type: typeof Enum['GRID_MODULE_K1']
  state: typeof Enum['STATE_IDLE']
  parent: IBaseModule
  children: (IBaseModule | KObject)[] 
  object3D: THREE['Object3D']
  init(): void
  clone(): IBaseModule
  cloneChildren(): IBaseModule['children']
  next: IBaseModule | undefined
  getNextChild(child: IBaseModule['children'][0]): IBaseModule['children'][0] | undefined
  prev: IBaseModule | undefined
  getPrevChild(child: IBaseModule['children'][0]): IBaseModule['children'][0] | undefined
  addObject(object: any): IBaseModule
  setObject3D(object: any): IBaseModule
  canModuleFitObject(object: any): boolean
  canChildModuleFitObject(module: IBaseModule, object: any): boolean
  update(data: any, recursive: boolean): IBaseModule
  updateParent(data: any, recursive: boolean): IBaseModule
}

export class BaseModule implements IBaseModule {
  width: number = null
  height: number = null
  depth: number = null
  type = Enum.GRID_MODULE_K1
  state = Enum.STATE_IDLE
  parent: IBaseModule
  object3D: any
  children: (BaseModule|KObject)[] 
  idx: number = null
  constructor(conf) {
    this.height = conf.height
    this.width = conf.width
    this.type = conf.type
    this.parent = conf.parent
    this.idx = conf.idx
    this.init()
  }
  init() { }
  clone() {
    const instance = new this['prototype']['constructor'](this) as IBaseModule
    instance.children = instance.cloneChildren()
    return instance
  }
  cloneChildren() {
    return this.children.map(child => child.clone())
  }
  get next() {
    return this.parent.getNextChild(this)
  }
  getNextChild(child) {
    return this.children[child.idx + 1]
  }
  get prev() {
    return this.parent.getPrevChild(this)
  }
  getPrevChild(child) {
    return this.children[child.idx - 1]
  }
  addObject(object) {
    this.children.push(object)
    return this
  }
  setObject3D(object3D) {
    this.object3D = object3D
    return this
  }
  canModuleFitObject(object) {
    return this.parent.canChildModuleFitObject(this, object)
  }
  canChildModuleFitObject(module, object) {
    // module specific logic
    // check if module is free
    // check object dimensions
    // get how many modules the object takes.
    // get n modules after current (crossing)
    // check if each is free
    // return boolean
    return false
  }
  update(data: any, recursive: boolean) {
    // update logic
    // if recursive also update children
    return this
  }
  updateParent(data: any, recursive: boolean) {
    this.parent.update(data, recursive)
    return this
  }
}
