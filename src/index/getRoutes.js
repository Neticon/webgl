const { routes } = require('./routes')

const $title = document.createElement('h2')
$title.textContent = 'Available tests in repo'
$title.style.fontFamily = 'consolas'
$title.style.lineHeight = '2em'

const $container = document.createElement('div')
$container.style.padding = '2em'
$container.style.fontFamily = 'consolas'
$container.style.lineHeight = '2em'

document.body.appendChild($container)
$container.appendChild($title)

routes
  .map(makeLink)
  .map(wrapInSpan)
  .map($container.appendChild.bind($container))

function makeLink(route) {
  const a = document.createElement('a')
  a.href = a.text = route
  a.target = '_blank'
  return a
}

function wrapInSpan($a){
  const $span = document.createElement('span')
  const $br = document.createElement('br')
  $span.appendChild($a)
  $span.appendChild($br)
  return $span
}