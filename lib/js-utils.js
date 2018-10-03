/**
 * takes a function that accepts a callback and returns a promise
 * @param fn
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