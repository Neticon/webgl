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

export function addDescription(text, color = '#bababa') {
  const el = document.createElement('div')
  el.style.display = 'inline-block'
  el.style.padding = '1em'
  el.style.position = 'absolute'
  el.style.left = 0
  el.style.top = 0
  el.style.color = color
  el.style.border = `1px solid ${color}`
  el.style.fontFamily = 'consolas'
  el.innerText = text
  document.body.appendChild(el)
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
