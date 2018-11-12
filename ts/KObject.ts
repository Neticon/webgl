import { BaseModule } from './BaseModule'
import { ContentModule } from './ContentModule'
import * as THREE from 'three'

export interface IKObject {
  parent: ContentModule
  object3D: THREE['Object3D']
  PIM_props: any
  init(conf: any): void
  clone(): IKObject
  update(): void
}

export class KObject implements IKObject {
  parent: ContentModule
  object3D: THREE['Object3D']
  PIM_props = {}
  constructor(conf) { }
  init() { }
  clone() {
    return new KObject(this)
  }
  update() { }
}

