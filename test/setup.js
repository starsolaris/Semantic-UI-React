/**
 * Setup
 * This is the bootstrap code that is run before any tests, utils, mocks.
 */
import chai from 'chai'
import dirtyChai from 'dirty-chai'
import _ from 'lodash'
import sinonChai from 'sinon-chai'
import {
  vi,
  expect as vitestExpect,
  describe,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest'
import '@testing-library/jest-dom/vitest'

import { shallow, mount } from './utils/renderCompat'

global.shallow = shallow
global.mount = mount
global.vi = vi
global.describe = describe
global.it = it
global.beforeAll = beforeAll
global.afterAll = afterAll
global.beforeEach = beforeEach
global.afterEach = afterEach
global.before = beforeAll
global.after = afterAll

// Configure global expect to work with both Chai and Jest matchers
const JEST_OBJECT_CONTAINING = Symbol('jest.objectContaining')

const subsetMatch = (actualValue, expectedValue) => {
  if (expectedValue && expectedValue[JEST_OBJECT_CONTAINING]) {
    return _.isMatch(actualValue, expectedValue.sample)
  }

  return _.isEqual(actualValue, expectedValue)
}

global.expect = Object.assign(
  (actual) => {
    const chaiExpect = chai.expect(actual)

    const actualValue = actual

    const checkHasClass = (className) => {
      const expectedClasses = String(className).split(/\s+/).filter(Boolean)

      if (actualValue && typeof actualValue.hasClass === 'function') {
        return expectedClasses.every((expectedClass) => actualValue.hasClass(expectedClass))
      }
      if (actualValue && actualValue.classList) {
        return expectedClasses.every((expectedClass) =>
          actualValue.classList.contains(expectedClass),
        )
      }
      if (actualValue && typeof actualValue.className === 'string') {
        const classes = actualValue.className.split(/\s+/)
        return expectedClasses.every((expectedClass) => classes.includes(expectedClass))
      }
      return false
    }

    chaiExpect.toHaveClass = function (className) {
      const hasClass = checkHasClass(className)
      const negate = chai.util.flag(this, 'negate')

      this.assert(
        negate ? !hasClass : hasClass,
        `expected #{this} to have class #{exp}`,
        `expected #{this} to not have class #{exp}`,
        className,
      )

      return this
    }

    chaiExpect.class = function (className) {
      const hasClass = checkHasClass(className)
      const negate = chai.util.flag(this, 'negate')

      this.assert(
        negate ? !hasClass : hasClass,
        `expected #{this} to have class #{exp}`,
        `expected #{this} to not have class #{exp}`,
        className,
      )
      return this
    }

    chaiExpect.toHaveTextContent = function (text) {
      const assertion = chai.util.flag(this, 'negate')
        ? vitestExpect(actualValue).not
        : vitestExpect(actualValue)
      assertion.toHaveTextContent(text)
      return this
    }

    chaiExpect.toBe = function (value) {
      return this.to.equal(value)
    }

    chaiExpect.toEqual = function (value) {
      return this.to.deep.equal(value)
    }

    chaiExpect.toBeTruthy = function () {
      return this.to.be.ok
    }

    chaiExpect.toBeFalsy = function () {
      return this.to.not.be.ok
    }

    chaiExpect.toBeNull = function () {
      return this.to.equal(null)
    }

    chaiExpect.toBeDefined = function () {
      return this.to.not.equal(undefined)
    }

    chaiExpect.toBeUndefined = function () {
      return this.to.equal(undefined)
    }

    chaiExpect.toBeInstanceOf = function (Ctor) {
      return this.to.be.instanceOf(Ctor)
    }

    chaiExpect.toBeGreaterThan = function (value) {
      return this.to.be.greaterThan(value)
    }

    chaiExpect.toBeLessThan = function (value) {
      return this.to.be.lessThan(value)
    }

    chaiExpect.toContain = function (value) {
      return this.to.contain(value)
    }

    chaiExpect.toMatch = function (value) {
      if (value instanceof RegExp) {
        return this.to.match(value)
      }

      return this.to.contain(value)
    }

    chaiExpect.toHaveLength = function (value) {
      return this.to.have.length(value)
    }

    chaiExpect.toHaveAttribute = function (name, value) {
      const attributeName = name === 'htmlFor' ? 'for' : name
      const hasAttribute = actualValue?.hasAttribute?.(attributeName) === true
      const attributeValue = actualValue?.getAttribute?.(attributeName)
      const negate = chai.util.flag(this, 'negate')

      this.assert(
        negate ? !hasAttribute : hasAttribute,
        `expected #{this} to have attribute #{exp}`,
        `expected #{this} to not have attribute #{exp}`,
        attributeName,
      )

      if (arguments.length > 1) {
        this.assert(
          negate ? attributeValue !== String(value) : attributeValue === String(value),
          `expected attribute #{exp} to equal #{act}`,
          `expected attribute #{exp} to not equal #{act}`,
          attributeName,
          attributeValue,
        )
      }

      return this
    }

    chaiExpect.attribute = chaiExpect.toHaveAttribute

    chaiExpect.toBeChecked = function () {
      const assertion = chai.util.flag(this, 'negate')
        ? vitestExpect(actualValue).not
        : vitestExpect(actualValue)
      assertion.toBeChecked()

      return this
    }

    chaiExpect.toBeDisabled = function () {
      const assertion = chai.util.flag(this, 'negate')
        ? vitestExpect(actualValue).not
        : vitestExpect(actualValue)
      assertion.toBeDisabled()

      return this
    }

    chaiExpect.toHaveStyle = function (styles) {
      const assertion = chai.util.flag(this, 'negate')
        ? vitestExpect(actualValue).not
        : vitestExpect(actualValue)
      assertion.toHaveStyle(styles)

      return this
    }

    chaiExpect.toHaveBeenCalledTimes = function (times) {
      this.assert(
        actualValue?.callCount === times,
        `expected spy to have been called #{exp} times but was called #{act} times`,
        `expected spy to not have been called #{exp} times`,
        times,
        actualValue?.callCount,
      )

      return this
    }

    chaiExpect.toHaveBeenCalled = function () {
      this.assert(
        (actualValue?.callCount || 0) > 0,
        'expected spy to have been called',
        'expected spy to not have been called',
      )

      return this
    }

    chaiExpect.toHaveBeenCalledOnce = function () {
      this.assert(
        actualValue?.callCount === 1,
        `expected spy to have been called once but was called #{act} times`,
        'expected spy to not have been called once',
        1,
        actualValue?.callCount,
      )

      return this
    }

    chaiExpect.toHaveBeenCalledWith = function (...expectedArgs) {
      const calls = actualValue?.args || []
      const didMatch = calls.some((callArgs) =>
        expectedArgs.every((expectedArg, index) => subsetMatch(callArgs[index], expectedArg)),
      )

      this.assert(
        didMatch,
        'expected spy to have been called with provided arguments',
        'expected spy to not have been called with provided arguments',
      )

      return this
    }

    return chaiExpect
  },
  {
    objectContaining: (sample) => ({ [JEST_OBJECT_CONTAINING]: true, sample }),
  },
)

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
