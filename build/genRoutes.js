const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const ifaces = require('os').networkInterfaces();

//console.log(JSON.stringify(ifaces,null,2));
const hostIface = Object.values(ifaces)
  .reduce((acc, type) => {
    type.map(iface => {
      if (
        iface.family.toLowerCase() === 'ipv4' &&
        !iface.internal
      ) {
        acc.address = iface.address
      }
    })
    return acc
  }, { address: 'localhost' })

const url = `http://${hostIface.address}:8007?entry=`

promisify(fs.readdir)(
  path.join(__dirname, '../src')
)
  .then(files => {
    return files.filter(x => x.match(/\.js$/) && x !== 'index.js')
  })
  .then(files => {
    const routes = files.map(file => `${url}${file.replace(/\.js$/, '')}`)
    const json = JSON.stringify({ routes }, null, 2)
    return promisify(fs.writeFile)(
      path.join(__dirname, '../src', 'index/routes.json'),
      json,
      'utf8'
    )
  })
  .then(x => 'yo')
  .catch(err => { throw err })