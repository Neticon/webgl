import { ContainerModule } from './ContainerModule'
import { BaseModule, IBaseModule } from './BaseModule'
import { KObject } from './KObject'

export class ContentModule extends BaseModule {
  parent: ContainerModule
  children: KObject[]
}
