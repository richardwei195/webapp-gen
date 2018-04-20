const home = function (req, res) {
  return {
    result: `this is home api`
  }
}
home.route = ['get', '/home']

module.exports = home
