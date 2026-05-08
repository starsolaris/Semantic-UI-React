import gulp from 'gulp'
import rimraf from 'rimraf'
import { finished } from 'stream/promises'
import through from 'through2'

import sh from '../sh.mjs'

const { dest, task, series, src, parallel } = gulp
const { paths } = (await import('../../config.js')).default

const rewriteDistIndexTypings = () =>
  through.obj((file, enc, cb) => {
    if (file.isNull()) {
      cb(null, file)
      return
    }

    if (file.isStream()) {
      cb(new Error('Streaming is not supported for declaration rewriting'))
      return
    }

    if (file.relative === 'index.d.ts') {
      file.contents = Buffer.from(
        file.contents
          .toString()
          .replaceAll('./dist/commonjs/', './')
          .replace("export * from './src/generic'", "export * from './generic'"),
      )
    }

    cb(null, file)
  })

const copyDistTypings = async (directory) => {
  const copySourceTypings = src(paths.src('**/*.d.ts'), { base: paths.src() }).pipe(dest(directory))
  const copyIndexTyping = src(paths.base('index.d.ts'), { base: paths.base() })
    .pipe(rewriteDistIndexTypings())
    .pipe(dest(directory))

  await Promise.all([finished(copySourceTypings), finished(copyIndexTyping)])
}

// ----------------------------------------
// Clean
// ----------------------------------------

task('clean:dist', (cb) => {
  rimraf(`${paths.dist()}/*`, cb)
})

// ----------------------------------------
// Build
// ----------------------------------------

task('build:dist:commonjs:js', (cb) => {
  sh(`yarn cross-env NODE_ENV=build babel ${paths.src()} -d ${paths.dist('commonjs')}`, cb)
})

task('build:dist:commonjs:tsd', () => copyDistTypings(paths.dist('commonjs')))

task('build:dist:commonjs', parallel('build:dist:commonjs:js', 'build:dist:commonjs:tsd'))

task('build:dist:es:js', (cb) => {
  sh(`yarn cross-env NODE_ENV=build-es babel ${paths.src()} -d ${paths.dist('es')}`, cb)
})

task('build:dist:es:tsd', () => copyDistTypings(paths.dist('es')))

task('build:dist:es', parallel('build:dist:es:js', 'build:dist:es:tsd'))

task('build:dist:umd', (cb) => {
  sh(
    `yarn cross-env NODE_ENV=build-umd webpack --config ${paths.base('webpack.umd.config.js')}`,
    cb,
  )
})

task('build:dist', parallel('build:dist:commonjs', 'build:dist:es', 'build:dist:umd'))

// ----------------------------------------
// Default
// ----------------------------------------

task('dist', series('clean:dist', 'build:dist'))
