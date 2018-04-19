## webApp-gen
> a lightly and fastly cli for generator a webApp server(Node.js)

## CATALOG

- /API
  - home.js
- /config
  - default.json5
- /test
- app.js
- route.js
- .gitignore


## HOW TO USE

webapp-gen cli had support create web server based on express

### Installation

From npm

```
npm install -g webserver-gen
```

From yarn

```
yarn add -g webserver-gen
```

### Usage

you can use commind flag:

```
webgen -e [your app name]
```

to build you first web app server based on express.

For CLI options, use the -h (or --help) argument:

```
webgen -h
```

## CHANGELOG

### 0.1.0 / 2018-04-19
- fix app.js
- perf generator package.json function

### 0.0.6 / 2018-04-19
- support `.gitignore`
- support `nodemon`
- update `README.md`
