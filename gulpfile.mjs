import { createRequire } from 'module'
import gulp from 'gulp'
import path from 'path'

// add node_modules/.bin to the path so we can invoke .bin CLIs in tasks
process.env.PATH = `${process.env.PATH}:${path.resolve('./node_modules/.bin')}`

// Patch Module.prototype.require BEFORE any task modules load.
// react-static@5.x uses spdy@3.4 which depends on http-deceiver which calls
// process.binding('http_parser') — removed in Node 12+. Mock it at the require level.
const require_ = createRequire(import.meta.url)
const Module = require_('module')
const origRequire = Module.prototype.require
Module.prototype.require = function (id) {
  if (id === 'spdy') {
    // Mock spdy so webpack-dev-server can be loaded without http_parser
    const EventEmitter = require_('events')
    class FakeSpdyServer extends EventEmitter {
      listen(port, cb) { if (cb) cb() }
      close(cb) { if (cb) cb() }
    }
    return {
      createServer(options, app) {
        return new FakeSpdyServer()
      },
    }
  }
  return origRequire.apply(this, arguments)
}

// load tasks in order of dependency usage
import './gulp/tasks/dist.mjs'

const requestedTasks = process.argv.slice(2)
const docsTaskNames = [
  'build:docs',
  'build:docs:static:build',
  'build:docs:static:reload',
  'build:docs:static:start',
  'clean:docs',
  'deploy:docs',
  'docs',
  'start',
  'start:docs',
]
const shouldLoadDocsTasks =
  requestedTasks.length === 0 ||
  requestedTasks.includes('build') ||
  requestedTasks.some((taskName) =>
    docsTaskNames.some(
      (docsTaskName) => taskName === docsTaskName || taskName.startsWith(`${docsTaskName}:`),
    ),
  )

if (shouldLoadDocsTasks) {
  await import('./gulp/tasks/docs.mjs')
}

const { task, parallel } = gulp

// global tasks
task('build', shouldLoadDocsTasks ? parallel('build:dist', 'build:docs') : parallel('build:dist'))
