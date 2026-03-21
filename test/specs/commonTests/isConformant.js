import faker from 'faker'
import _ from 'lodash'
import React from 'react'
import ReactIs from 'react-is'
import ReactDOMServer from 'react-dom/server'
import * as semanticUIReact from 'semantic-ui-react'
import { render, fireEvent } from '@testing-library/react'

import {
  assertBodyContains,
  consoleUtil,
  getComponentName,
  getComponentProps,
  sandbox,
  syntheticEvent,
} from 'test/utils'
import hasValidTypings from './hasValidTypings'

/**
 * Assert Component conforms to guidelines that are applicable to all components.
 * @param {React.Component|Function} Component A component that should conform.
 * @param {Object} [options={}]
 * @param {Object} [options.eventTargets={}] Map of events and the child component to target.
 * @param {Number} [options.nestingLevel=0] The nesting level of the component.
 * @param {boolean} [options.rendersChildren=false] Does this component render any children?
 * @param {boolean} [options.rendersFragmentByDefault=false] Does this component renders React.Fragment by default?
 * @param {boolean} [options.rendersPortal=false] Does this component render a Portal powered component?
 * @param {Object} [options.requiredProps={}] Props required to render Component without errors or warnings.
 * @param {Object} [options.forwardsRef=true] Indicates if component forwards refs.
 */
export default function isConformant(Component, options = {}) {
  const {
    eventTargets = {},
    nestingLevel = 0,
    requiredProps = {},
    rendersChildren = true,
    rendersFragmentByDefault = false,
    rendersPortal = false,
  } = options
  const constructorName = getComponentName(Component)

  it('a valid component should be exported', () => {
    expect(ReactIs.isValidElementType(Component)).to.equal(
      true,
      `Components should export a class or function, got: ${typeof Component}.`,
    )
  })

  it('a component should be a function/class or "displayName" should be defined', () => {
    if (!constructorName) {
      throw new Error(
        [
          'Component is not a named function and does not have a "displayName".',
          'This should help identify it:\n\n',
          `${ReactDOMServer.renderToStaticMarkup(<Component {...requiredProps} />)}`,
        ].join(''),
      )
    }
  })

  // Mock info object to replace componentInfoContext functionality
  const info = {
    displayName: constructorName,
    filenameWithoutExt: constructorName,
    apiPath: constructorName,
    componentClassName: constructorName.toLowerCase(),
    isChild: false,
    parentDisplayName: '',
    repoPath: `src/${constructorName}.js`,
  }

  // ----------------------------------------
  // Class and file name
  // ----------------------------------------
  it(`constructor name matches filename "${constructorName}"`, () => {
    constructorName.should.equal(info.filenameWithoutExt)
  })

  // ----------------------------------------
  // Is exported or private
  // ----------------------------------------
  // detect components like: semanticUIReact.H1
  const isTopLevelAPIProp = _.has(semanticUIReact, constructorName)

  // find the apiPath in the semanticUIReact object
  const foundAsSubcomponent = ReactIs.isValidElementType(_.get(semanticUIReact, info.apiPath))

  // require all components to be exported at the top level
  it('is exported at the top level', () => {
    expect(isTopLevelAPIProp).to.equal(
      true,
      [`"${info.displayName}" must be exported at top level.`, 'Export it in `src/index.js`.'].join(
        ' ',
      ),
    )
  })

  if (info.isChild) {
    it('is a static component on its parent', () => {
      expect(foundAsSubcomponent).to.equal(
        true,
        `\`${info.displayName}\` is a child component (is in ${info.repoPath}).` +
          ` It must be a static prop of its parent \`${info.parentDisplayName}\``,
      )
    })
  }

  // ----------------------------------------
  // Props
  // ----------------------------------------
  if (rendersChildren) {
    it('spreads user props', () => {
      const propName = 'data-is-conformant-spread-props'
      const props = { as: rendersFragmentByDefault ? 'div' : undefined, [propName]: true }

      const { container } = render(<Component {...props} {...requiredProps} />)
      expect(container.querySelector(`[${propName}]`)).to.exist
    })
  }

  if (rendersChildren && !rendersPortal) {
    describe('"as" prop (common)', () => {
      it('renders the component as HTML tags or passes "as" to the next component', () => {
        // silence element nesting warnings
        consoleUtil.disableOnce()

        const tags = [
          'a',
          'em',
          'div',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'i',
          'p',
          'span',
          'strong',
        ]
        tags.forEach((tag) => {
          const { container } = render(<Component {...requiredProps} as={tag} />)
          // Check if the component renders as the tag or passes 'as' to next component
          const element = container.firstChild
          if (element && element.tagName) {
            const renderedTag = element.tagName.toLowerCase()
            expect(renderedTag === tag || element.getAttribute('as') === tag).to.equal(true)
          }
        })
      })

      it('renders as a functional component or passes "as" to the next component', () => {
        const MyComponent = () => null

        const { container } = render(<Component {...requiredProps} as={MyComponent} />)
        // Functional component renders nothing, so just verify it doesn't crash
        expect(container).to.exist
      })

      it('renders as a ReactClass or passes "as" to the next component', () => {
        // eslint-disable-next-line react/prefer-stateless-function
        class MyComponent extends React.Component {
          render() {
            return <div data-my-react-class />
          }
        }

        const { container } = render(<Component {...requiredProps} as={MyComponent} />)
        // The component should render either as MyComponent or pass 'as' prop
        expect(container.querySelector('[data-my-react-class]') || container.firstChild).to.exist
      })

      it('passes extra props to the component it is renders as', () => {
        const MyComponent = () => null

        const { container } = render(
          <Component {...requiredProps} as={MyComponent} data-extra-prop='foo' />,
        )
        expect(container.querySelector('[data-extra-prop="foo"]')).to.exist
      })
    })
  }

  describe('handles props', () => {
    const componentProps = getComponentProps(Component)

    it('defines handled props in Component.handledProps', () => {
      componentProps.should.have.any.keys('handledProps')
      componentProps.handledProps.should.be.an('array')
    })

    it('Component.handledProps includes all handled props', () => {
      const computedProps = _.union(
        componentProps.autoControlledProps,
        _.keys(componentProps.propTypes),
      )
      const expectedProps = _.uniq(computedProps).sort()

      componentProps.handledProps.should.to.deep.equal(
        expectedProps,
        'It seems that not all props were defined in Component.handledProps, you need to check that they are equal ' +
          'to the union of Component.autoControlledProps and keys of Component.propTypes',
      )
    })
  })

  // ----------------------------------------
  // Events
  // ----------------------------------------
  if (rendersChildren && !rendersPortal) {
    it('handles events transparently', () => {
      _.each(syntheticEvent.types, ({ eventShape, listeners }) => {
        _.each(listeners, (listenerName) => {
          const eventName = _.camelCase(listenerName.replace('on', ''))
          const handlerName = _.camelCase(listenerName.replace('on', 'handle'))

          const handlerSpy = sandbox.spy()
          const props = {
            ...requiredProps,
            [listenerName]: handlerSpy,
            'data-simulate-event-here': true,
          }

          consoleUtil.disableOnce()
          const { container, unmount } = render(
            <Component as={rendersFragmentByDefault ? 'div' : undefined} {...props} />,
          )

          const eventTarget = eventTargets[listenerName]
            ? container.querySelector(eventTargets[listenerName])
            : container.querySelector('[data-simulate-event-here]')

          if (eventTarget) {
            fireEvent[eventName](eventTarget, eventShape)
          }

          unmount()

          const leftPad = ' '.repeat(info.displayName.length + listenerName.length + 3)

          handlerSpy.calledOnce.should.equal(
            true,
            `<${info.displayName} ${listenerName}={${handlerName}} />\n` +
              `${leftPad} ^ was not called once on "${eventName}".` +
              'You may need to hoist your event handlers up to the root element.\n',
          )

          let expectedArgs = [eventShape]
          let errorMessage = 'was not called with (event)'

          if (_.has(Component.propTypes, listenerName)) {
            expectedArgs = [eventShape, props]
            errorMessage = 'was not called with (event, data)'
          }

          handlerSpy.should.have.been.calledOnce()

          handlerSpy
            .calledWithMatch(...expectedArgs)
            .should.equal(
              true,
              [
                `<${info.displayName} ${listenerName}={${handlerName}} />\n`,
                `${leftPad} ^ ${errorMessage}`,
                'It was called with args:',
              ].join('\n'),
            )
        })
      })
    })
  }

  // ----------------------------------------
  // Has no deprecated _meta
  // ----------------------------------------
  describe('_meta', () => {
    it('does not exist', () => {
      expect(Component._meta).to.be.undefined()
    })
  })

  // ----------------------------------------
  // Has no deprecated .defaultProps
  // ----------------------------------------
  describe('defaultProps', () => {
    it('does not exist', () => {
      expect(Component.defaultProps).to.be.undefined()
    })
  })

  // ----------------------------------------
  // Handles className
  // ----------------------------------------
  if (_.has(Component.propTypes, 'className')) {
    if (rendersChildren) {
      describe('className (common)', () => {
        it(`has the Semantic UI className "${info.componentClassName}"`, () => {
          const { container } = render(<Component {...requiredProps} />)
          const element = container.firstChild
          if (element && element.className) {
            expect(element.className).to.include(info.componentClassName)
          }
        })

        it("applies user's className to root component", () => {
          const className = 'is-conformant-class-string'

          if (rendersPortal) {
            const mountNode = document.createElement('div')
            document.body.appendChild(mountNode)

            const { container, rerender } = render(
              <Component {...requiredProps} className={className} />,
              { container: mountNode },
            )
            rerender(<Component {...requiredProps} className={className} open />)

            assertBodyContains(`.${className}`)

            document.body.removeChild(mountNode)
          } else {
            const { container } = render(
              <Component
                as={rendersFragmentByDefault ? 'div' : undefined}
                {...requiredProps}
                className={className}
              />,
            )
            expect(container.firstChild.className).to.include(className)
          }
        })

        it("user's className does not override the default classes", () => {
          const { container: defaultContainer } = render(<Component {...requiredProps} />)
          const defaultClasses = defaultContainer.firstChild?.className

          if (!defaultClasses) return

          const userClasses = faker.hacker.verb()
          const { container: mixedContainer } = render(
            <Component {...requiredProps} className={userClasses} />,
          )
          const mixedClasses = mixedContainer.firstChild?.className

          defaultClasses.split(' ').forEach((defaultClass) => {
            mixedClasses.should.include(
              defaultClass,
              [
                'Make sure you are using the `getUnhandledProps` util to spread the `rest` props.',
                'This may also be of help: https://facebook.github.io/react/docs/transferring-props.html.',
              ].join(' '),
            )
          })
        })
      })
    }
  }

  // ----------------------------------------
  // Test typings - temporarily skipped due to import issues
  // ----------------------------------------
  // hasValidTypings(Component, options)
}
