Proposal for the Kriptonite grid

![Kriptonite grid UML class diagram](./uml/combined.svg)

This is a UML class diagram proposal for the Kriptonite grid.

Entities are 
- GridModule (K1, K2, Krossing)
- ContainerModule (Vertical Module for K1, K2, Horizontal Module for Krossing)
- ContentModule (portion of a ContainerModule that can fit an object)
- KObject (Kriptonite Object. This would be analog to a component. Contains _PIM props_ and the threejs object3D created according to the PIM props) 

The GridModule is meant to be parsed during rendering to generate the webgl view (and the additional visual clues/ui controls)

<img alt="Grid module 2d" src="./uml/k2d.jpg" height="200"/>
<img alt="Grid module 3d" src="./uml/k3d.jpg" height="200"/>
<br><div style="background:red;height:15px;width:15px;display:inline-block"></div> GridModule
<br><div style="background:yellow;height:15px;width:15px;display:inline-block"></div> ContainerModule
<br><div style="background:orange;height:15px;width:15px;display:inline-block"></div> ContentModule
<br><div style="background:blue;height:15px;width:15px;display:inline-block;border-radius:100%"></div> ContentModule.children=null
<br><div style="background:green;height:15px;width:15px;display:inline-block;border-radius:100%"></div> ContentModule.children = [KObject Shelf]
<br><div style="background:purple;height:15px;width:15px;display:inline-block;border-radius:100%"></div> ContentModule.children = [KObject Shelf, KObject Box]

Module classes inherit from BaseModule. 
Here main property and methods are listed, more to be added.
Specific business logic and visualization logic of modules will be dependent on type and parent.type

Example  
ContainerModule.canChildModuleFitObject(ContentModule, KObject)

Logic will depend on 
- ContainerModule.type (Enum.CONTAINER_MODULE_HORIZONTAL or Enum.CONTAINER_MODULE_VERTICAL)
- parent.type (Enum.GRID_MODULE_K1 or Enum.GRID_MODULE_K2 or Enum.GRID_MODULE_KROSSING)
- parent.type_mount (Enum.MOUNT_WALL or Enum.MOUNT_FLOOR)
- parent.type_hAlign (Enum.ALIGN_TOP or Enum.ALIGN_BOTTOM)





