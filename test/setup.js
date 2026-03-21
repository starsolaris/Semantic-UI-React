/**
 * Setup
 * This is the bootstrap code that is run before any tests, utils, mocks.
 */
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
import {
  vi,
  describe,
  it,
  expect as vitestExpect,
  beforeEach,
  afterEach,
  before,
  after,
} from 'vitest'
import '@testing-library/jest-dom/vitest'

import nestedShallow from './utils/nestedShallow'

import { shallow, mount } from './utils/enzymeCompat'

global.shallow = shallow
global.mount = mount
global.vi = vi
global.describe = describe
global.it = it
global.beforeEach = beforeEach
global.afterEach = afterEach
global.before = before
global.after = after

// Configure global expect to work with both Chai and Jest matchers
global.expect = (actual) => {
  const chaiExpect = chai.expect(actual)
  const vitestExpectResult = vitestExpect(actual)

  // Add Jest-like matchers to Chai
  chaiExpect.toHaveClass = function (className) {
    return this.hasClass(className)
  }

  chaiExpect.not.toHaveClass = function (className) {
    return this.not.hasClass(className)
  }

  chaiExpect.toHaveTextContent = function (text) {
    return this.to.have.deep.property('textContent', text)
  }

  chaiExpect.not.toHaveTextContent = function (text) {
    return this.to.not.have.deep.property('textContent', text)
  }

  chaiExpect.toBeTruthy = function () {
    return this.to.be.true
  }

  chaiExpect.not.toBeTruthy = function () {
    return this.to.not.be.true
  }

  chaiExpect.toBeFalsy = function () {
    return this.to.be.false
  }

  chaiExpect.not.toBeFalsy = function () {
    return this.to.not.be.false
  }

  return chaiExpect
}

chai.should()
chai.use(dirtyChai)
chai.use(sinonChai)

// ----------------------------------------
// Console
// ----------------------------------------
// Fail on all activity.
// It is important we overload console here, before consoleUtil.js is loaded and caches it.
let log
let info
let warn
let error

const throwOnConsole =
  (method) =>
  (...args) => {
    throw new Error(
      `console.${method} should never be called but was called with:\n${args.join(' ')}`,
    )
  }

/* eslint-disable no-console */
beforeEach(() => {
  log = console.log
  info = console.info
  warn = console.warn
  error = console.error

  console.log = throwOnConsole('log')
  console.info = throwOnConsole('info')
  console.warn = throwOnConsole('warn')
  console.error = throwOnConsole('error')
})
afterEach(() => {
  console.log = log
  console.info = info
  console.warn = warn
  console.error = error
})
/* eslint-enable no-console */
