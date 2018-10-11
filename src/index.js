const { 0: qryParam, 1: qryValue } = location.search.slice(1).split('&').map(x => x.split('='))[0]
const defaultValue = 'index/getRoutes'
if (qryParam === 'entry') {
  require(`./${qryValue || defaultValue}.js`)
} else {
  require(`./${defaultValue}.js`)
}

