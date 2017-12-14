#!/usr/bin/env node

const program = require('commander')
const fs = require('fs')
const path = require('path')
const readline = require('readline')
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
    this._genType = 'javascript'
  }
  set genType (type) {
    this._genType = type
  }

  build () {
    // Path
    let destinationPath = program.args.shift() || '.'

    // App name
    let appName = this.createAppName(path.resolve(destinationPath)) || this._appName
  }

  createAppName(pathName) {
    return path.basename(pathName)
      .replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
      .replace(/^[-_.]+|-+$/g, '')
      .toLowerCase()
  }

  confirm(msg, callback) {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question(msg, function (input) {
      rl.close()
      callback(/^y|yes|ok|true$/i.test(input))
    })
  }
}

const gen = new Generator()

program
  .version('0.1.0')
  .usage('[options] [dir]')
  .option('-j, --javascript', gen.genType = 'javascript')
  .parse(process.argv)

if (!exit.exited) {
  gen.build()
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
