const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify

const url = 'http://localhost:8007?entry='

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