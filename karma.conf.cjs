const fs = require('fs')
const puppeteer = require('puppeteer')

const config = require('./config.js')
const webpackConfig = require('./webpack.karma.config.js')

process.env.CHROME_BIN = puppeteer.executablePath()

const { paths } = config

const formatError = (msg) => {
  if (!msg.trim() || /~/.test(msg) || /node_modules\//.test(msg)) return ''

  let newLine = `  ${msg}`

  if (newLine.includes('webpack:///')) {
    newLine = newLine.replace('webpack:///', '')
    newLine = newLine.slice(0, newLine.indexOf(' <- '))
  }

  return `${newLine}\n`
}

module.exports = (karmaConfig) => {
  karmaConfig.set({
    basePath: __dirname,
    browsers: ['puppeteer'],
    browserConsoleLogOptions: {
      level: 'log',
      terminal: true,
    },
    client: {
      mocha: {
        reporter: 'html',
        ui: 'bdd',
      },
    },
    coverageReporter: {
      reporters: [{ type: 'lcov', dir: 'coverage', subdir: '.' }],
      includeAllSources: true,
    },
    customLaunchers: {
      puppeteer: {
        base: 'ChromeHeadless',
        flags: [
          '--disable-setuid-sandbox',
          '--no-sandbox',
          '--stack-trace-limit 200000',
        ],
      },
    },
    files: [
      './node_modules/@babel/standalone/babel.js',
      './node_modules/lodash/lodash.js',
      './node_modules/react/umd/react.development.js',
      './node_modules/react-dom/umd/react-dom.development.js',
      './node_modules/react-dom/umd/react-dom-server.browser.development.js',

      { pattern: 'docs/public/logo.png', watched: false, included: false, served: true },
      { pattern: 'docs/public/**/*.jpg', watched: false, included: false, served: true },
      { pattern: 'docs/public/**/*.png', watched: false, included: false, served: true },
      './test/tests.bundle.js',
    ],
    formatError,
    frameworks: ['mocha'],
    proxies: fs.readdirSync(paths.docsPublic()).reduce((acc, file) => {
      const isDir = fs.statSync(paths.docsPublic(file)).isDirectory()
      const trailingSlash = isDir ? '/' : ''

      const original = `/${file}${trailingSlash}`
      acc[original] = `/base/docs/public/${trailingSlash}`

      return acc
    }, {}),
    reporters: ['mocha', 'coverage'],
    reportSlowerThan: 100,
    singleRun: true,
    preprocessors: {
      'test/tests.bundle.js': ['webpack'],
    },
    webpack: {
      ...webpackConfig,
      entry: './test/tests.bundle.js',
    },
    webpackServer: {
      progress: false,
      stats: config.compiler_stats,
      debug: true,
      noInfo: false,
      quiet: false,
    },
  })
}
