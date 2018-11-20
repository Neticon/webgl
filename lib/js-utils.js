/**
 * takes a function that accepts a callback and returns a promise
 * @param {Function} fn 
 * the function to promify
 * @param cbPos
 * callback position (last) 'first' | 'last' | n
 * @param cbArgs
 * callback arguments (rjt,rsv) 'rjt,rsv' | 'rsv' | etc..
 */
export const promifyFn = (fn, cbPos = 'last', cbArgs = 'rjt,rsv') =>
  (...args) =>
    new Promise((rsv, rjt) => {
      const _cbArgs = cbArgs.split(',').map(x => x === 'rjt' ? rjt : (x === 'rsv' ? rsv : () => {/**/ }))
      const _cbFn = (...cbRes) => {
        cbRes.map((res, idx) => {
          if (res !== undefined && res !== null) {
            _cbArgs[idx](res)
          }
        })
      }
      if (cbPos === 'last') {
        args.push(_cbFn)
      } else if (cbPos === 'first') {
        args.unshift(_cbFn)
      } else if (typeof cbPos === 'number') {
        args.splice(cbPos, 0, _cbFn)
      }
      else {
        rjt('cbPos should be either "first" or "last" or a number')
      }
      try { fn(...args) } catch (err) { rjt(err) }
    })

export function addDescription(text, color = '#bababa', bg = '#303030') {
  color = toHex(color)
  bg = toHex(bg)
  text = expandTokens(text)
  let opened = true
  const btnChars = ['x', '>']

  const el = document.createElement('div')
  el.style.display = 'inline-block'
  el.style.padding = '1em'
  el.style.position = 'absolute'
  el.style.left = 0
  el.style.top = 0
  el.style.color = color
  el.style.background = bg
  el.style.border = `1px solid ${color}`
  el.style.fontFamily = 'consolas'
  el.style.maxWidth = '25vw'
  el.style.maxHeight = '50vh'
  el.style.overflow = 'auto'
  el.style.transition = 'all .5s ease-in-out'
  el.innerHTML = text

  const btn = document.createElement('button')
  btn.style.position = 'absolute'
  btn.style.top = 0
  btn.style.right = 0
  btn.style.fontFamily = 'consolas'
  btn.style.fontSize = '2em'
  btn.style.padding = '0em .5em'
  btn.style.background = color
  btn.style.border = 'none'
  btn.style.color = 'red'
  btn.innerText = btnChars[0]

  btn.addEventListener('mousedown', e => {
    if (opened) {
      el.style.maxWidth = '0'
      el.style.maxHeight = '0'
      el.style.overflow = 'hidden'
      btn.innerText = btnChars[1]
    } else {
      el.style.maxWidth = '25vw'
      el.style.maxHeight = '50vh'
      el.style.overflow = 'auto'
      btn.innerText = btnChars[0]
    }
    opened = !opened
  })
  el.appendChild(btn)
  document.body.appendChild(el)
}

function expandTokens(text) {
  const tokens = [
    [/\r\n|\r|\n/, '<br/>'],
    [/\{\{nbsp}}/, '&nbsp;&nbsp;&nbsp;&nbsp;'],

  ]
  const fns = {
    square(color) {
      return `<span style="background:${color};width:20px;height:20px;display:inline-block"></span>`
    },
    link(href, text, color="orange"){
      return `<a href="${href}" target="_blank" style="color:${color}">${text}</a>`
    }
  }
  const fnPattern = /\{fn\{.*?\(.*?\)}}/

  let _text = tokens
    .reduce((acc, [pattern, replace]) => 
    acc.replace(new RegExp(pattern, 'g'), replace),
      text)
  let fnResults = (_text.match(new RegExp(fnPattern, 'g')) || [])
    .map(match => {
      const [fn, argStr] = match
        .replace('{fn{', '')
        .replace(')}}','')
        .split('(')
      const args = argStr.split(',')
      return fns[fn](...args)
    })
  for(let result of fnResults){
    _text = _text.replace(fnPattern,result)
  }
  return _text
}

function toHex(color) {
  let _color = (color).toString(16).replace('#', '')
  if (_color.length > 6) {
    _color = (_color + 'f').slice(0, 8)
  } else {
    _color = ('000000' + _color).slice(_color.length)
  }
  return '#' + _color
}

export function arrPick(src, n) {
  const dest = new src.constructor(src.length / n | 0)
  let idx = 0

  for (let i = n - 1; i < src.length; i += n) {
    dest[idx++] = src[i]
  }

  return dest
}

export function arrSplit(src, n) {
  if (n === 0) { return src }
  const dest = new src.constructor(src.length / n + .99 | 0).fill('').map(x => [])

  for (let idx = 0; idx < src.length; idx++) {
    dest[idx / n | 0].push(src[idx])
  }

  return dest
}

export function arrIntersperse(src, n, el) {
  //const dest = new src.constructor(src.length + src.length / n | 0)
  const dest = []
  const split = arrSplit(src, n)
  const _el = el instanceof Array ? el : [el]

  split.map((x, idx) => {
    dest.push(x)
    if (idx + 1 < split.length) {
      dest.push(_el)
    }
  })

  return arrFlatten(dest)
}

export function arrFlatten(src) {
  const dest = new src.constructor(src.reduce((acc, item) => acc += item.length, 0))
  let idx = 0

  src.map(arr => {
    arr.map(item => {
      dest[idx++] = item
    })
  })

  return dest
}

export function arrTap(fn) {
  return (acc, item, idx, arr) =>
    idx + 1 === arr.length
      ? fn(arr)
      : null
}
