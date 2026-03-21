import React, { isValidElement } from 'react'
import { consoleUtil, getComponentName } from 'test/utils'

export default function implementsCreateMethod(Component) {
  describe('create shorthand method (common)', () => {
    const name = getComponentName(Component)

    beforeEach(() => {
      consoleUtil.disableOnce()
    })

    it('is a static method', () => {
      expect(Component).to.have.property('create')
      expect(typeof Component.create).to.equal('function')
    })

    it(`creates a ${name} from a string`, () => {
      expect(isValidElement(Component.create('foo'))).to.equal(true)
    })

    it(`creates a ${name} from a number`, () => {
      expect(isValidElement(Component.create(123))).to.equal(true)
    })

    it(`creates a ${name} from a number 0`, () => {
      expect(isValidElement(Component.create(0))).to.equal(true)
    })

    it(`creates a ${name} from a props object`, () => {
      expect(isValidElement(Component.create({ 'data-foo': 'bar' }))).to.equal(true)
    })

    it(`creates a ${name} from an array`, () => {
      consoleUtil.disableOnce()
      expect(isValidElement(Component.create(['foo', 123, { 'data-foo': 'bar' }]))).to.equal(true)
    })

    it(`creates a ${name} from an element`, () => {
      expect(isValidElement(Component.create(<div />))).to.equal(true)
    })

    it('returns null when passed null', () => {
      expect(Component.create(null)).to.equal(null)
    })

    it('returns null when passed undefined', () => {
      expect(Component.create(undefined)).to.equal(null)
    })

    it('returns null when passed true', () => {
      expect(Component.create(true)).to.equal(null)
    })

    it('returns null when passed false', () => {
      expect(Component.create(false)).to.equal(null)
    })
  })
}
