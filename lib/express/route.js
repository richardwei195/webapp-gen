const requireDir = require('require-dir')

function route (app) {
  const _routes = requireDir('./api', { recurse: true })
  let apis = Object.keys(_routes)
  apis.forEach(api => {
    api = _routes[api]
    const [method, url] = api.route

    app[method](url, (req, res, next) => {
      res.json(api(req))
    })
  })
}

module.exports = route
