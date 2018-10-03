# webgl-tests
this is a test repo focused on development with webgl

## Build Setup
Assumes [git-cli](https://git-scm.com/downloads) and [nodejs](https://nodejs.org/en/) are installed locally

__As of now, this project runs on browsers that support ES6 generators, so to avoid including babel-regenerator runtime polyfill.__

``` bash
#clone repo locally
git clone https://github.com/Neticon/webgl-tests.git

# install dependencies
npm i

# serve with hot reload at localhost:8007
npm run dev
```

## Dependencies

There are only 2 dependencies, [threejs](https://threejs.org/) and [dat.gui](http://workshop.chromeexperiments.com/examples/gui/#1--Basic-Usage)


**Threejs** is js library that provides a very convenient API for working with WebGL. It abstracts away most of the complexity of the native WebGL API provided by the browser. 

Similar to the convenience methods JQuery provides for manipulating the DOM, making Ajax calls and simple animations, threejs provides huge wrappers for creating geometries, defining and applying materials and lights, applying matrix transformations to the whole scene or individual objects via the use of entities like 'camera', 'position', 'rotation' and more.
Compared to JQuery the abstraction in threejs is much stronger.

Here is a [nice and short presentation](http://davidscottlyons.com/threejs-intro/#slide-0)

**dat.GUI** is a lightweight graphical user interface for changing variables in JavaScript.
It provides a standard gui for one-way or two-way binding to selected property values. 

It has different controls for numbers (range), strings (input), booleans (checkbox) and colors (color picker).
It is widely used in WebGL projects because it allows to make real time changes to parameters that affect rendering, making testing and development far quicker that changing those parameters in the source code every time or adding DOM controls and binding manually.

## Content

As a very primordial starting point here a RB2132 model is rendered.
Files used are .obj and .mtl for Frame, Lenses, and Temple components.

**.obj** files contain the vertices coordinates in 3d spaces plus various information that describe which vertices compose which face, how the light should reflect off those faces, how a texture px maps to which face coordinates.

**.mtl** (material template library) files define materials properties (color [ambient, diffuse, specular], opacity, illumination) and associated textures file names. These materials are then recalled from the .obj file for individual geometries.

See [this wikipedia entry](https://en.wikipedia.org/wiki/Wavefront_.obj_file) for a more detailed explanation.

Total size of .obj and .mtl for this model components is <1MB

.obj are exported as low-poly geometries, enriched runtime via vertex subdivision.

http://locahost:8007?entry=smoothing shows this process with a simple cube. Play with the 'subdivisions' control to add interpolated vertices.

As of now, the model is rendered without textures. Only color and material properties (standard PhongMaterial) are appreciable.

Next step is to enrich the material with textures and detailed properties, and have textures loaded dynamically via controls.

Other small tests are included in the repo

http://locahost:8007?entry=cubes
<br/>http://locahost:8007?entry=head
<br/>http://locahost:8007?entry=particles
<br/>http://locahost:8007?entry=sea
<br/>http://locahost:8007?entry=shader
<br/>http://locahost:8007?entry=shader2











