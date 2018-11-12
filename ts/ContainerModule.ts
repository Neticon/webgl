import { ContentModule } from './ContentModule'
import { GridModule } from './GridModule'
import { BaseModule } from './BaseModule'

export class ContainerModule extends BaseModule{
 children: ContentModule[]
 parent: GridModule
}