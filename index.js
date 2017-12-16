#!/usr/bin/env node

const program = require('commander')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const mkdirp = require('mkdirp')
const co = require('co')
const pkg = require('./package.json')

var _exit = process.exit;
var version = pkg.version;

// Re-assign process.exit because of commander
// TODO: Switch to a different command framework
process.exit = exit

// CLI

around(program, 'optionMissingArgument', function (fn, args) {
  program.outputHelp()
  fn.apply(this, args)
  return { args: [], unknown: [] }
})

before(program, 'outputHelp', function () {
  // track if help was shown for unknown option
  this._helpShown = true
})

before(program, 'unknownOption', function () {
  // allow unknown options if help was shown, to prevent trailing error
  this._allowUnknownOption = this._helpShown
  // show help if not yet shown
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
    // people who was in
    this.destinationPath = program.args.shift() || '.'
    // App name
    this._appName = createAppName(path.resolve(__dirname, this.destinationPath)) || this._appName

    yield this.createFile()    
  }

  * createFile() {
    const baseUrl = __dirname + '/lib/express'
    switch (this._genType) {
      case 'express':
        // make express config
        const _path = yield done => mkdirp(this.destinationPath + '/config', done)

        // make app.js
        fs.copyFileSync(path.join(baseUrl, 'app.js'), path.join(_path + '/app.js'))
        // make config
        fs.copyFileSync(path.join(baseUrl, '/config/default.json5'), path.join(_path + '/config/default.json5'))

        // make package.js
        let pkg = {
          name: this._appName,
          version: '0.0.0',
          private: true,
          scripts: {
            start: 'node app.js'
          },
          dependencies: {
            'body-parser': '~1.17.1',
            'cookie-parser': '~1.4.3',
            "cookie-session": "^1.2.0",
            'debug': '~2.6.3',
            'express': '~4.16.0',
            'morgan': '~1.8.1',
            'serve-favicon': '~2.4.2',
            "cors": "^2.8.4",
            "require-dir": "^0.3.2",
            "config": "^1.28.1"
          },
          devDependencies: {
            "yarn": "^1.3.2"
          }
        }
        fs.writeFileSync(_path + '/package.json', JSON.stringify(pkg, null, 2))

        break;

      default:
        break;
    }
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

function createAppName(pathName) {
  return path.basename(pathName)
    .replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
    .replace(/^[-_.]+|-+$/g, '')
    .toLowerCase()
}

/**
 * Install an around function; AOP.
 */

function around(obj, method, fn) {
  var old = obj[method]

  obj[method] = function () {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) args[i] = arguments[i]
    return fn.call(this, old, args)
  }
}

/**
 * Install a before function; AOP.
 */

function before(obj, method, fn) {
  var old = obj[method]

  obj[method] = function () {
    fn.call(this)
    old.apply(this, arguments)
  }
}

/**
 * Graceful exit for async STDIO
 */

function exit(code) {
  // flush output for Node.js Windows pipe bug
  // https://github.com/joyent/node/issues/6247 is just one bug example
  // https://github.com/visionmedia/mocha/issues/333 has a good discussion
  function done() {
    if (!(draining--)) _exit(code)
  }

  var draining = 0
  var streams = [process.stdout, process.stderr]

  exit.exited = true

  streams.forEach(function (stream) {
    // submit empty write request and wait for completion
    draining += 1
    stream.write('', done)
  })

  done()
}