import { BaseModule } from './BaseModule'
import { ContainerModule } from './ContainerModule'
import { Enum } from './Enum'


export class GridModule extends BaseModule{
 children: ContainerModule[]
 type_mount = Enum.MOUNT_WALL
 type_hAlign = Enum.ALIGN_TOP 
 parent = null
}
