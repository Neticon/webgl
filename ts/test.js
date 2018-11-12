const tsuml = require('typescript-uml')

const x = tsuml.TypeScriptUml.parseFile(__dirname + '/HorizontalModule.ts',6)
const y= tsuml.TypeScriptUml.generateClassDiagram(x, {
  formatter: 'plantuml',
  plantuml: {
      diagramTags: false,
  }
})

console.log(x.nodes)