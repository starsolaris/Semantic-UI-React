/* eslint-disable no-console */
import faker from 'faker'
import _ from 'lodash'
import React from 'react'
import { render } from '@testing-library/react'

import { ModernAutoControlledComponent as AutoControlledComponent } from 'src/lib'
import { consoleUtil } from 'test/utils'

let TestClass

/* eslint-disable */
const createTestClass = (options = {}) =>
  class Test extends AutoControlledComponent {
    static autoControlledProps = options.autoControlledProps
    static defaultProps = options.defaultProps
    getInitialAutoControlledState() {
      return options.state
    }
    render = () => <div />
  }
/* eslint-enable */

const toDefaultName = (prop) => `default${prop.slice(0, 1).toUpperCase() + prop.slice(1)}`

const makeProps = () => ({
  computer: 'hardware',
  flux: 'capacitor',
  ion: 'belt',
})

const makeDefaultProps = (props) =>
  _.transform(props, (res, val, key) => {
    res[toDefaultName(key)] = val
  })

describe('extending AutoControlledComponent', () => {
  beforeEach(() => {
    TestClass = createTestClass({ autoControlledProps: [], state: {} })
  })

  it('does not throw with a `null` state', () => {
    TestClass = createTestClass({ autoControlledProps: [], state: null })
    render(<TestClass />)
  })

  it('getAutoControlledStateFromProps', () => {
    consoleUtil.disableOnce()

    TestClass = createTestClass({
      autoControlledProps: ['open'],
      defaultProps: ['defaultOpen'],
      state: { open: false, value: 'initial' },
    })
    TestClass.getAutoControlledStateFromProps = (props, state) => {
      return {
        openProp: props.open,
        openState: state.open,
        modifiedValue: `${state.value} + auto`,
      }
    }
    const { container } = render(<TestClass open />)

    expect(container.firstChild).to.exist()
  })

  describe('setState', () => {
    it('sets state for autoControlledProps', () => {
      consoleUtil.disableOnce()

      const autoControlledProps = _.keys(makeProps())
      const randomProp = _.sample(autoControlledProps)
      const randomValue = faker.hacker.verb()

      TestClass = createTestClass({ autoControlledProps })
      const { container } = render(<TestClass />)

      expect(container.firstChild).to.exist()
    })

    it('does not set state for props defined by the parent', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      const randomProp = _.sample(autoControlledProps)
      const randomValue = faker.hacker.phrase()

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const { container } = render(<TestClass {...props} />)

      expect(container.firstChild).to.exist()
    })

    it('sets state for props passed as undefined by the parent', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      const randomProp = _.sample(autoControlledProps)
      const randomValue = faker.hacker.phrase()

      props[randomProp] = undefined

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const { container } = render(<TestClass {...props} />)

      expect(container.firstChild).to.exist()
    })

    it('does not set state for props passed as null by the parent', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      const randomProp = _.sample(autoControlledProps)
      const randomValue = faker.hacker.phrase()

      props[randomProp] = null

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const { container } = render(<TestClass {...props} />)

      expect(container.firstChild).to.exist()
    })
  })

  describe('initial state', () => {
    it('is derived from autoControlledProps in props', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const { container } = render(<TestClass {...props} />)

      expect(container.firstChild).to.exist()
    })

    it('does not include non autoControlledProps', () => {
      const props = makeProps()
      const { container } = render(<TestClass {...props} />)

      expect(container.firstChild).to.exist()
    })

    it('includes non autoControlled state', () => {
      const props = makeProps()

      TestClass = createTestClass({ autoControlledProps: [], state: { foo: 'bar' } })
      const { container } = render(<TestClass {...props} />)

      expect(container.firstChild).to.exist()
    })

    it('uses the initial state if default and regular props are undefined', () => {
      consoleUtil.disableOnce()

      const defaultProps = { defaultFoo: undefined }
      const autoControlledProps = ['foo']

      TestClass = createTestClass({ autoControlledProps, defaultProps, state: { foo: 'bar' } })
      const { container } = render(<TestClass foo={undefined} />)

      expect(container.firstChild).to.exist()
    })

    it('uses the default prop if the regular prop is undefined', () => {
      consoleUtil.disableOnce()

      const defaultProps = { defaultFoo: 'default' }
      const autoControlledProps = ['foo']

      TestClass = createTestClass({ autoControlledProps, defaultProps, state: {} })
      const { container } = render(<TestClass foo={undefined} />)

      expect(container.firstChild).to.exist()
    })

    it('uses the regular prop when a default is also defined', () => {
      consoleUtil.disableOnce()

      const defaultProps = { defaultFoo: 'default' }
      const autoControlledProps = ['foo']

      TestClass = createTestClass({ autoControlledProps, defaultProps, state: {} })
      const { container } = render(<TestClass foo='initial' />)

      expect(container.firstChild).to.exist()
    })

    it('defaults "checked" to false if not present', () => {
      consoleUtil.disableOnce()
      TestClass.autoControlledProps.push('checked')

      const { container } = render(<TestClass />)

      expect(container.firstChild).to.exist()
    })

    it('defaults "value" to an empty string if not present', () => {
      consoleUtil.disableOnce()
      TestClass.autoControlledProps.push('value')

      const { container } = render(<TestClass />)

      expect(container.firstChild).to.exist()
    })

    it('defaults "value" to an empty array if "multiple"', () => {
      consoleUtil.disableOnce()
      TestClass.autoControlledProps.push('value')

      const { container } = render(<TestClass multiple />)

      expect(container.firstChild).to.exist()
    })
  })

  describe('default props', () => {
    it('are applied to state for props in autoControlledProps', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)
      const defaultProps = makeDefaultProps(props)

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const { container } = render(<TestClass {...defaultProps} />)

      expect(container.firstChild).to.exist()
    })

    it('are not applied to state for normal props', () => {
      const props = makeProps()
      const defaultProps = makeDefaultProps(props)

      const { container } = render(<TestClass {...defaultProps} />)

      expect(container.firstChild).to.exist()
    })

    it('allows setState to work on non-default autoControlledProps', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)
      const defaultProps = makeDefaultProps(props)

      const randomProp = _.sample(autoControlledProps)
      const randomValue = faker.hacker.phrase()

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const { container } = render(<TestClass {...defaultProps} />)

      expect(container.firstChild).to.exist()
    })
  })

  describe('changing props', () => {
    it('sets state for props in autoControlledProps', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      const randomProp = _.sample(autoControlledProps)
      const randomValue = faker.hacker.phrase()

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const { container, rerender } = render(<TestClass {...props} />)

      rerender(<TestClass {...props} {...{ [randomProp]: randomValue }} />)

      expect(container.firstChild).to.exist()
    })

    it('does not set state for props not in autoControlledProps', () => {
      consoleUtil.disableOnce()
      const props = makeProps()

      const randomProp = _.sample(_.keys(props))
      const randomValue = faker.hacker.phrase()

      TestClass = createTestClass({ autoControlledProps: [], state: {} })
      const { container, rerender } = render(<TestClass {...props} />)

      rerender(<TestClass {...props} {...{ [randomProp]: randomValue }} />)

      expect(container.firstChild).to.exist()
    })

    it('does not set state for default props when changed', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)
      const defaultProps = makeDefaultProps(props)

      const randomDefaultProp = _.sample(defaultProps)
      const randomValue = faker.hacker.phrase()

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const { container, rerender } = render(<TestClass {...defaultProps} />)

      rerender(<TestClass {...defaultProps} {...{ [randomDefaultProp]: randomValue }} />)

      expect(container.firstChild).to.exist()
    })

    it('does not return state to default props when setting props undefined', () => {
      consoleUtil.disableOnce()

      const autoControlledProps = ['foo']
      const defaultProps = { defaultFoo: 'default' }

      TestClass = createTestClass({ autoControlledProps, defaultProps, state: {} })
      const { container, rerender } = render(<TestClass foo='initial' />)

      rerender(<TestClass foo={undefined} />)

      expect(container.firstChild).to.exist()
    })

    it('does not set state for props passed as null by the parent', () => {
      consoleUtil.disableOnce()

      const props = makeProps()
      const autoControlledProps = _.keys(props)

      const randomProp = _.sample(autoControlledProps)

      TestClass = createTestClass({ autoControlledProps, state: {} })
      const { container, rerender } = render(<TestClass {...props} />)

      rerender(<TestClass {...props} {...{ [randomProp]: null }} />)

      expect(container.firstChild).to.exist()
    })
  })
})
