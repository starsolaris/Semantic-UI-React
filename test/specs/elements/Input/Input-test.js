import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Icon from 'src/elements/Icon/Icon'
import Input from 'src/elements/Input/Input'
import { htmlInputProps } from 'src/lib'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'
import nestedShallow from 'test/utils/nestedShallow'

describe('Input', () => {
  common.isConformant(Input, {
    eventTargets: {
      // keyboard
      onKeyDown: 'input',
      onKeyPress: 'input',
      onKeyUp: 'input',

      // focus
      onFocus: 'input',
      onBlur: 'input',

      // form
      onChange: 'input',
      onInput: 'input',

      // mouse
      onClick: 'input',
      onContextMenu: 'input',
      onDrag: 'input',
      onDragEnd: 'input',
      onDragEnter: 'input',
      onDragExit: 'input',
      onDragLeave: 'input',
      onDragOver: 'input',
      onDragStart: 'input',
      onDrop: 'input',
      onMouseDown: 'input',
      onMouseEnter: 'input',
      onMouseLeave: 'input',
      onMouseMove: 'input',
      onMouseOut: 'input',
      onMouseOver: 'input',
      onMouseUp: 'input',

      // selection
      onSelect: 'input',

      // touch
      onTouchCancel: 'input',
      onTouchEnd: 'input',
      onTouchMove: 'input',
      onTouchStart: 'input',
    },
  })
  common.forwardsRef(Input, { tagName: 'input' })
  common.hasUIClassName(Input)
  common.rendersChildren(Input, {
    rendersContent: false,
  })

  common.implementsButtonProp(Input, {
    autoGenerateKey: false,
    propKey: 'action',
  })
  common.implementsCreateMethod(Input)
  common.implementsIconProp(Input, { autoGenerateKey: false })
  common.implementsLabelProp(Input, {
    autoGenerateKey: false,
    shorthandDefaultProps: { className: 'label' },
  })
  common.implementsHTMLInputProp(Input, {
    alwaysPresent: true,
    assertExactMatch: false,
    autoGenerateKey: false,
    shorthandDefaultProps: { type: 'text' },
  })

  common.propKeyAndValueToClassName(Input, 'actionPosition', ['left'], { className: 'action' })
  common.propKeyAndValueToClassName(Input, 'iconPosition', ['left'], { className: 'icon' })
  common.propKeyAndValueToClassName(
    Input,
    'labelPosition',
    ['left', 'right', 'left corner', 'right corner'],
    {
      className: 'labeled',
    },
  )

  common.propKeyOnlyToClassName(Input, 'action')
  common.propKeyOnlyToClassName(Input, 'disabled')
  common.propKeyOnlyToClassName(Input, 'error')
  common.propKeyOnlyToClassName(Input, 'fluid')
  common.propKeyOnlyToClassName(Input, 'focus')
  common.propKeyOnlyToClassName(Input, 'inverted')
  common.propKeyOnlyToClassName(Input, 'label', { className: 'labeled' })
  common.propKeyOnlyToClassName(Input, 'loading')
  common.propKeyOnlyToClassName(Input, 'loading', { className: 'icon' })
  common.propKeyOnlyToClassName(Input, 'transparent')
  common.propKeyOnlyToClassName(Input, 'icon')

  common.propValueOnlyToClassName(Input, 'size', [
    'mini',
    'small',
    'large',
    'big',
    'huge',
    'massive',
  ])

  it('renders with conditional children', () => {
    const { container } = render(
      <Input>
        {true && <span />}
        {false && <div />}
      </Input>,
    )

    expect(container.querySelector('span')).to.not.be.null()
    expect(container.querySelector('div')).to.be.null()
  })

  it('renders a text <input> by default', () => {
    const element = nestedShallow(<Input />)
    const input = element.querySelector('input')

    expect(input.type).to.equal('text')
  })

  describe('input props', () => {
    htmlInputProps.forEach((propName) => {
      it(`passes \`${propName}\` to the <input>`, () => {
        const propValue = propName === 'onChange' ? () => null : 'foo'
        const element = nestedShallow(<Input {...{ [propName]: propValue }} />)
        const input = element.querySelector('input')

        // account for overloading the onChange prop
        if (propName === 'onChange') {
          expect(input[propName]).to.be.a('function')
        } else {
          expect(input[propName]).to.equal(propValue)
        }
      })

      it(`passes \`${propName}\` to the <input> when using children`, () => {
        const propValue = propName === 'onChange' ? () => null : 'foo'
        const element = nestedShallow(
          <Input {...{ [propName]: propValue }}>
            <input />
          </Input>,
        )
        const input = element.querySelector('input')

        // account for overloading the onChange prop
        if (propName === 'onChange') {
          expect(input[propName]).to.be.a('function')
        } else {
          expect(input[propName]).to.equal(propValue)
        }
      })
    })
  })

  describe('loading', () => {
    it("don't add icon if it's defined", () => {
      const element = nestedShallow(<Input icon='user' loading />)
      const icon = element.querySelector('i.icon')

      expect(icon.className).to.include('user')
    })

    it("adds icon if it's not defined", () => {
      const element = nestedShallow(<Input loading />)
      const icon = element.querySelector('i.icon')

      expect(icon.className).to.include('spinner')
    })
  })

  describe('onChange', () => {
    it('is called with (e, data) on change', () => {
      const onChange = sandbox.spy()
      const e = { target: { value: 'name' } }
      const props = { 'data-foo': 'bar', onChange }

      const element = nestedShallow(<Input {...props} />)
      const input = element.querySelector('input')

      fireEvent.change(input, e)

      onChange.should.have.been.calledOnce()
      onChange.should.have.been.calledWithMatch(e, { ...props, value: e.target.value })
    })

    it('is called with (e, data) on change when using children', () => {
      const onChange = sandbox.spy()
      const e = { target: { value: 'name' } }
      const props = { 'data-foo': 'bar', onChange }

      const element = nestedShallow(
        <Input {...props}>
          <input />
        </Input>,
      )
      const input = element.querySelector('input')

      fireEvent.change(input, e)

      onChange.should.have.been.calledOnce()
      onChange.should.have.been.calledWithMatch(e, { ...props, value: e.target.value })
    })
  })

  describe('ref', () => {
    it('"focus" can be set via a ref', () => {
      const inputRef = React.createRef()
      const mountNode = document.createElement('div')
      document.body.appendChild(mountNode)

      render(<Input ref={inputRef} />, { container: mountNode })
      inputRef.current.focus()

      const input = document.querySelector('.ui.input input')
      document.activeElement.should.equal(input)

      document.body.removeChild(mountNode)
    })

    it('"select" can be set via a ref', () => {
      const inputRef = React.createRef()
      const mountNode = document.createElement('div')
      document.body.appendChild(mountNode)

      const value = 'expect this text to be selected'
      render(<Input ref={inputRef} value={value} />, { container: mountNode })
      inputRef.current.select()

      window.getSelection().toString().should.equal(value)

      document.body.removeChild(mountNode)
    })

    it('maintains ref on child node', () => {
      const elementRef = sandbox.spy()
      const inputRef = sandbox.spy()

      const mountNode = document.createElement('div')
      document.body.appendChild(mountNode)

      render(
        <Input ref={inputRef}>
          <input ref={elementRef} />
        </Input>,
        { container: mountNode },
      )
      const input = document.querySelector('.ui.input input')

      elementRef.should.have.been.calledOnce()
      elementRef.should.have.been.calledWithMatch(input)
      inputRef.should.have.been.calledWithMatch(input)

      document.body.removeChild(mountNode)
    })
  })

  describe('disabled', () => {
    it('is applied to the underlying html input element', () => {
      let element = nestedShallow(<Input disabled />)
      let input = element.querySelector('input')
      expect(input.disabled).to.equal(true)

      element = nestedShallow(<Input disabled={false} />)
      input = element.querySelector('input')
      expect(input.disabled).to.equal(false)
    })
  })

  describe('tabIndex', () => {
    it('is not set by default', () => {
      const element = nestedShallow(<Input />)
      const input = element.querySelector('input')

      expect(input.tabIndex).to.equal(0)
    })

    it('defaults to -1 when disabled', () => {
      const element = nestedShallow(<Input disabled />)
      const input = element.querySelector('input')

      expect(input.tabIndex).to.equal(-1)
    })

    it('can be set explicitly', () => {
      const element = nestedShallow(<Input tabIndex={123} />)
      const input = element.querySelector('input')

      expect(input.tabIndex).to.equal(123)
    })

    it('can be set explicitly when disabled', () => {
      const element = nestedShallow(<Input tabIndex={123} disabled />)
      const input = element.querySelector('input')

      expect(input.tabIndex).to.equal(123)
    })
  })

  describe('icon', () => {
    it('is second child', () => {
      const element = nestedShallow(<Input icon='search' />)
      const children = element.children

      expect(children[1].tagName.toLowerCase()).to.equal('i')
    })

    it('is third child with action positioned left', () => {
      const element = nestedShallow(<Input icon='search' action='foo' actionPosition='left' />)
      const children = element.children

      expect(children[2].tagName.toLowerCase()).to.equal('i')
    })

    it('is third child with label', () => {
      const element = nestedShallow(<Input icon='search' label='foo' />)
      const children = element.children

      expect(children[2].tagName.toLowerCase()).to.equal('i')
    })

    it('is second child with action', () => {
      const element = nestedShallow(<Input icon='search' iconPosition='left' action='foo' />)
      const children = element.children

      expect(children[1].tagName.toLowerCase()).to.equal('i')
    })

    it('is second child with label positioned right', () => {
      const element = nestedShallow(
        <Input icon='search' iconPosition='left' label='foo' labelPosition='right' />,
      )
      const children = element.children

      expect(children[1].tagName.toLowerCase()).to.equal('i')
    })
  })
})
