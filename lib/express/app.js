const config = require('config')
const port = process.env.PORT || config.port
const express = require('express')
const parser = require('body-parser')
const log4js = require('log4js')
// if you need
// const session = require('cookie-session')
// const requireDir = require('require-dir')
// requireDir('./config', { recurse: true })
const pkg = require('./package.json')
const route = require('./route')

const app = express()
// API no cache, avoid code 304
app.disable('etag')

// use log4js to build and show logs
log4js.configure(config.logger)
const logger = log4js.getLogger('app')
app.use(log4js.connectLogger(logger))

app.use(parser.json({ limit: '500kb' }))
app.use(parser.urlencoded({ extended: true }))
app.use(require('cookie-parser')())
// app.use(session(config.sessionConfig))

route(app)
app.get(['/', '/api'], (req, res, next) => {
  res.json(`API version: ${pkg.version}`)
})

app.listen(port, () => {
  console.log('-- start successfully at port: ', port)
  console.log('-- version', pkg.version)
})
