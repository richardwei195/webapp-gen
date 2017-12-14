#!/usr/bin/env node

const program = require('commander')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

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

if (!process.exit) {
  console.log('123', 123)
}

gen.build()