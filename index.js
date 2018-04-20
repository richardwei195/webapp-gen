#!/usr/bin/env node

const program = require('commander')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const co = require('co')
const pkg = require('./package.json')

var _exit = process.exit
var version = pkg.version

process.exit = exit

// CLI

around(program, 'optionMissingArgument', function (fn, args) {
  program.outputHelp()
  fn.apply(this, args)
  return { args: [], unknown: [] }
})

before(program, 'outputHelp', function () {
  this._helpShown = true
})

before(program, 'unknownOption', function () {
  this._allowUnknownOption = this._helpShown
  if (!this._helpShown) {
    program.outputHelp()
  }
})

class Generator {
  constructor () {
    this._appName = 'hello-world'
    this._genType = 'express'
    this.destinationPath = '.'
  }

  set genType (type) {
    this._genType = type
  }

  * build () {
    this.destinationPath = program.args.shift() || '.'
    this._appName = createAppName(path.resolve(__dirname, this.destinationPath)) || this._appName

    yield this.createFile()
  }

  * createFile () {
    this.baseUrl = path.join(__dirname, '/lib/express')
    switch (this._genType) {
      case 'express':
        // make express config
        const _path = yield done => mkdirp(this.destinationPath + '/config', done)
        // make api
        this.genAPIs()
        // make app.js
        fs.copyFileSync(path.join(this.baseUrl, 'app.js'), path.join(_path + '/app.js'))
        // make config
        fs.copyFileSync(path.join(this.baseUrl, '/config/default.json5'), path.join(_path + '/config/default.json5'))
        // make route
        fs.copyFileSync(path.join(this.baseUrl, 'route.js'), path.join(_path + '/route.js'))
        // make .gitignore
        fs.copyFileSync(path.join(this.baseUrl, 'gitignore-temp'), path.join(_path + '/.gitignore'))
        // make package.json
        this.genPackagejson()
        break
      default:
        break
    }
  }

  /**
   * @desc generator apis
   */
  genAPIs () {
    fs.mkdirSync(this.destinationPath + '/api')
    fs.copyFileSync(path.join(this.baseUrl, '/api/home.js'), path.join(this.destinationPath + '/api/home.js'))
  }

  genPackagejson () {
    let pkg = {
      name: this._appName,
      version: '0.0.0',
      private: true,
      scripts: {
        start: 'node app.js',
        dev: 'NODE_ENV=dev nodemon app.js'
      },
      dependencies: {
        'body-parser': '~1.17.1',
        'cookie-parser': '~1.4.3',
        'cookie-session': '^1.2.0',
        'debug': '~2.6.3',
        'express': '~4.16.0',
        'morgan': '~1.8.1',
        'serve-favicon': '~2.4.2',
        'cors': '^2.8.4',
        'require-dir': '^0.3.2',
        'config': '^1.28.1',
        'log4js': '^2.5.3'
      },
      devDependencies: {
        'yarn': '^1.3.2',
        'nodemon': '~1.17.3'
      }
    }
    fs.writeFileSync(this.destinationPath + '/package.json', JSON.stringify(pkg, null, 2))
  }
}

const gen = new Generator()

program
  .version(version, '-v, --version')
  .usage('[options] [dir]')
  .option('-e, --express', gen.genType = 'express')
  .parse(process.argv)

if (!exit.exited) {
  co(gen.build())
}

function createAppName (pathName) {
  return path.basename(pathName)
    .replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
    .replace(/^[-_.]+|-+$/g, '')
    .toLowerCase()
}

function around (obj, method, fn) {
  var old = obj[method]

  obj[method] = function () {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) args[i] = arguments[i]
    return fn.call(this, old, args)
  }
}

function before (obj, method, fn) {
  var old = obj[method]

  obj[method] = function () {
    fn.call(this)
    old.apply(this, arguments)
  }
}

function exit (code) {
  function done () {
    if (!(draining--)) _exit(code)
  }

  var draining = 0
  var streams = [process.stdout, process.stderr]

  exit.exited = true

  streams.forEach(function (stream) {
    draining += 1
    stream.write('', done)
  })

  done()
}
