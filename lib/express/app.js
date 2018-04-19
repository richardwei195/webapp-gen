const config = require('config')
const express = require('express')
const parser = require('body-parser')
// if you need
// const session = require('cookie-session')
// const requireDir = require('require-dir')
// requireDir('./config', { recurse: true })
const pkg = require('./package.json')
const route = require('./route')

const app = express()
// API no cache, avoid code 304
app.disable('etag')

app.use(parser.json({ limit: '500kb' }))
app.use(parser.urlencoded({ extended: true }))
app.use(require('cookie-parser')())
// app.use(session(config.sessionConfig))

app.use(route)
app.get(['/', '/api'], (req, res, next) => {
  res.json(`API version: ${pkg.version}`)
})

const port = process.env.PORT || config.port
app.listen(port, () => {
  console.log('-- start successfully at port: ', port)
  console.log('-- version', pkg.version)
})
