const parser = (()=>{
  const parser = new DOMParser()
  return str => parse.parseFromString(str, 'text/html').body.firstChild
})()

const styler = (elem, styleObj)=>{
  for(const rule of Object.entries(styleObj)){
    // need some sort of _.get
  }
}


module.exports ={
  parser,

}