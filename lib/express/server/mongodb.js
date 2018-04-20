const mongoose = require('mongoose')
const config = require('config')
mongoose.Promise = Promise

module.exports = function () {
  const options = {
    promiseLibrary: Promise
  }
  if (config.mongodb.auth_db) {
    options.auth = {
      authdb: config.mongodb.auth_db
    }
  }

  const connection = mongoose.createConnection(config.mongodb.db_url, options)

  connection.on('error', () => {

  })
}
