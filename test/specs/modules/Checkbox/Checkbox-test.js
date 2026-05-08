import _ from 'lodash'
import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'

import { htmlInputAttrs } from 'src/lib'
import Checkbox from 'src/modules/Checkbox/Checkbox'
import * as common from 'test/specs/commonTests'
import { domEvent, sandbox } from 'test/utils'

describe('Checkbox', () => {
  common.isConformant(Checkbox)
  common.forwardsRef(Checkbox, { tagName: 'input' })
  common.hasUIClassName(Checkbox)

  common.propKeyOnlyToClassName(Checkbox, 'checked')
  common.propKeyOnlyToClassName(Checkbox, 'disabled')
  common.propKeyOnlyToClassName(Checkbox, 'readOnly', {
    className: 'read-only',
  })
  common.propKeyOnlyToClassName(Checkbox, 'slider')
  common.propKeyOnlyToClassName(Checkbox, 'toggle')

  common.implementsHTMLLabelProp(Checkbox, {
    alwaysPresent: true,
    autoGenerateKey: false,
  })

  describe('aria', () => {
    ;['aria-label', 'role'].forEach((propName) => {
      it(`passes "${propName}" to the <input>`, () => {
        const { container } = render(<Checkbox {...{ [propName]: 'foo' }} />)
        const input = container.querySelector('input')
        expect(input).toHaveAttribute(propName)
      })
    })
  })

  describe('checking', () => {
    it('can be checked and unchecked', () => {
      const { container } = render(<Checkbox />)

      const input = container.querySelector('input')

      expect(container.firstChild.classList.contains('checked')).to.equal(false)

      fireEvent.click(input)
      expect(input.checked).to.equal(true)

      fireEvent.click(input)
      expect(input.checked).to.equal(false)
    })

    it('can be checked but not unchecked when radio', () => {
      const { container } = render(<Checkbox radio />)

      const input = container.querySelector('input')

      expect(container.firstChild.classList.contains('checked')).to.equal(false)

      fireEvent.click(input)
      expect(input.checked).to.equal(true)

      fireEvent.click(input)
      expect(input.checked).to.equal(true)
    })
  })

  describe('defaultChecked', () => {
    it('sets the initial checked state', () => {
      const { container } = render(<Checkbox defaultChecked />)
      const input = container.querySelector('input')
      expect(input).toBeChecked()
    })
  })

  describe('indeterminate', () => {
    it('can be indeterminate', () => {
      const { container } = render(<Checkbox indeterminate />)
      const input = container.querySelector('.ui.checkbox input')

      expect(input.indeterminate).to.equal(true)

      fireEvent.click(input)
      expect(input.indeterminate).to.equal(true)
    })

    it('can not be indeterminate', () => {
      const { container } = render(<Checkbox indeterminate={false} />)
      const input = container.querySelector('.ui.checkbox input')

      expect(input.indeterminate).to.equal(false)

      fireEvent.click(input)
      expect(input.indeterminate).to.equal(false)
    })
  })

  describe('defaultIndeterminate', () => {
    it('sets the initial indeterminate state', () => {
      const { container } = render(<Checkbox defaultIndeterminate />)
      const input = container.querySelector('.ui.checkbox input')

      expect(input.indeterminate).to.equal(true)
    })

    it('unsets indeterminate state on any click', () => {
      const { container } = render(<Checkbox defaultIndeterminate />)
      const input = container.querySelector('.ui.checkbox input')

      expect(input.indeterminate).to.equal(true)

      fireEvent.click(input)
      expect(input.indeterminate).to.equal(false)

      fireEvent.click(input)
      expect(input.indeterminate).to.equal(false)
    })
  })

  describe('disabled', () => {
    it('cannot be checked', () => {
      const { container } = render(<Checkbox disabled />)

      const input = container.querySelector('input')

      fireEvent.click(input)
      expect(input.checked).to.equal(false)
    })

    it('cannot be unchecked', () => {
      const { container } = render(<Checkbox defaultChecked disabled />)

      const label = container.querySelector('label')
      const input = container.querySelector('input')

      fireEvent.mouseUp(label)
      fireEvent.click(label)
      expect(container.firstChild).toHaveClass('checked')
    })

    it('is applied to the underlying html input element', () => {
      const { container: container1 } = render(<Checkbox disabled />)
      const { container: container2 } = render(<Checkbox disabled={false} />)

      const input1 = container1.querySelector('input')
      const input2 = container2.querySelector('input')

      expect(input1.disabled).to.equal(true)
      expect(input2.disabled).to.equal(false)
    })
  })

  describe('id', () => {
    it('passes value to the input', () => {
      const { container } = render(<Checkbox id='foo' />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('id', 'foo')
    })

    it('adds htmlFor prop to the label', () => {
      const { container } = render(<Checkbox id='foo' />)
      const label = container.querySelector('label')
      expect(label.getAttribute('for')).to.equal('foo')
    })

    it('adds htmlFor prop to the label when it is empty', () => {
      const { container } = render(<Checkbox id='foo' label={null} />)
      const label = container.querySelector('label')
      expect(label.getAttribute('for')).to.equal('foo')
    })
  })

  describe('input', () => {
    const props = _.without(htmlInputAttrs, 'defaultChecked', 'disabled', 'autoFocus')

    _.forEach(props, (propName) => {
      it(`passes "${propName}" to the input`, () => {
        const { container } = render(<Checkbox {...{ [propName]: 'radio' }} />)
        const input = container.querySelector('input')
        if (propName === 'defaultValue') {
          expect(input.defaultValue).to.equal('radio')
        } else {
          expect(input).toHaveAttribute(propName)
        }
      })
    })

    it('passes "autoFocus" to the input', () => {
      const { container } = render(<Checkbox autoFocus />)
      const input = container.querySelector('input')
      expect(document.activeElement).to.equal(input)
    })
  })

  describe('label', () => {
    it('adds the "fitted" class when not present', () => {
      const { container } = render(<Checkbox name='firstName' />)
      expect(container.firstChild).toHaveClass('fitted')
    })

    it('adds the "fitted" class when is null', () => {
      const { container } = render(<Checkbox name='firstName' />)
      expect(container.firstChild).toHaveClass('fitted')
    })

    it('does not add the "fitted" class when is not nil', () => {
      const { container: c1 } = render(<Checkbox name='firstName' label='' />)
      const { container: c2 } = render(<Checkbox name='firstName' label={0} />)

      expect(c1.firstChild.classList.contains('fitted')).to.equal(false)
      expect(c2.firstChild.classList.contains('fitted')).to.equal(false)
    })
  })

  describe('onChange', () => {
    it('is called with (e, data) on mouse up', () => {
      const onChange = sandbox.spy()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }

      const { container } = render(<Checkbox onChange={onChange} {...props} />)

      const label = container.querySelector('label')
      fireEvent.mouseUp(label)
      fireEvent.click(label)

      onChange.should.have.been.calledOnce()
      onChange.should.have.been.calledWithMatch(
        {},
        {
          ...props,
          checked: true,
          indeterminate: false,
        },
      )
    })

    it('is called when on change when "id" is passed', () => {
      const onChange = sandbox.spy()
      const { container } = render(<Checkbox id='foo' onChange={onChange} />)

      const label = container.querySelector('label')
      fireEvent.mouseUp(label)
      fireEvent.click(label)
      onChange.should.have.been.calledOnce()
    })

    it('is called when click is done on nested element', () => {
      const onChange = sandbox.spy()
      const { container } = render(
        <Checkbox label={{ children: <span>Foo</span> }} onChange={onChange} />,
      )

      const span = container.querySelector('span')
      fireEvent.mouseUp(span)
      fireEvent.click(span)

      onChange.should.have.been.calledOnce()
    })
  })

  describe('onClick', () => {
    it('is called with (event, data) on click', () => {
      const onClick = sandbox.spy()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }
      const { container } = render(<Checkbox onClick={onClick} {...props} />)

      fireEvent.click(container.firstChild)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch(
        {},
        {
          ...props,
          checked: true,
        },
      )
    })

    it('is called when "id" is passed', () => {
      const onClick = sandbox.spy()
      const { container } = render(<Checkbox id='foo' onClick={onClick} />)

      const label = container.querySelector('label')
      fireEvent.mouseUp(label)
      fireEvent.click(label)
      onClick.should.have.been.calledOnce()
    })
  })

  describe('onMouseDown', () => {
    it('is called with (event, data) on mouse down', () => {
      const onMousedDown = sandbox.spy()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }
      const { container } = render(<Checkbox onMouseDown={onMousedDown} {...props} />)

      fireEvent.mouseDown(container.firstChild)

      onMousedDown.should.have.been.calledOnce()
      onMousedDown.should.have.been.calledWithMatch({}, props)
    })

    it('sets focus to container', () => {
      const { container } = render(<Checkbox />)
      const input = container.querySelector('.ui.checkbox input')

      fireEvent.mouseDown(input)
      expect(document.activeElement).to.equal(input)
    })

    it('will not set focus to container, if default is prevented', () => {
      const { container } = render(<Checkbox onMouseDown={(e) => e.preventDefault()} />)

      const input = container.querySelector('.ui.checkbox input')
      fireEvent.mouseDown(input)
      expect(document.activeElement).to.equal(document.body)
    })
  })

  describe('onMouseUp', () => {
    it('is called with (event, data) on mouse up', () => {
      const onMouseUp = sandbox.spy()
      const props = { name: 'foo', value: 'bar', checked: false, indeterminate: true }
      const { container } = render(<Checkbox onMouseUp={onMouseUp} {...props} />)

      fireEvent.mouseUp(container.firstChild)

      onMouseUp.should.have.been.calledOnce()
      onMouseUp.should.have.been.calledWithMatch({}, props)
    })

    it('is called with (event, data) on mouse up with right button', () => {
      const onMouseUp = sandbox.spy()
      const { container } = render(<Checkbox id='foo' onMouseUp={onMouseUp} />)

      fireEvent.mouseUp(container.firstChild, { button: 2 })

      onMouseUp.should.have.been.calledOnce()
    })
  })

  describe('readOnly', () => {
    it('cannot be checked', () => {
      const { container } = render(<Checkbox readOnly />)

      const input = container.querySelector('input')

      fireEvent.click(input)
      expect(input.checked).to.equal(false)
    })
    it('cannot be unchecked', () => {
      const { container } = render(<Checkbox defaultChecked readOnly />)

      const input = container.querySelector('input')

      fireEvent.click(input)
      expect(input.checked).to.equal(true)
    })
  })

  describe('tabIndex', () => {
    it('defaults to 0', () => {
      const { container } = render(<Checkbox />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('tabIndex', '0')
    })
    it('defaults to -1 when disabled', () => {
      const { container } = render(<Checkbox disabled />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('tabIndex', '-1')
    })
    it('can be set explicitly', () => {
      const { container } = render(<Checkbox tabIndex={123} />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('tabIndex', '123')
    })
    it('can be set explicitly when disabled', () => {
      const { container } = render(<Checkbox tabIndex={123} disabled />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('tabIndex', '123')
    })
  })

  describe('type', () => {
    it('renders an input of type checkbox when not set', () => {
      const { container } = render(<Checkbox />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'checkbox')
    })
    it('sets the input type ', () => {
      const { container: c1 } = render(<Checkbox type='checkbox' />)
      const { container: c2 } = render(<Checkbox type='radio' />)

      expect(c1.querySelector('input')).toHaveAttribute('type', 'checkbox')
      expect(c2.querySelector('input')).toHaveAttribute('type', 'radio')
    })
  })

  describe('comparisons with native DOM', () => {
    const assertMatrix = [
      {
        description: 'click on label: fires on mouse click',
        events: {
          label: ['mouseup', 'click'],
        },
      },
      {
        description: 'click on input: fires on mouse click',
        events: {
          input: ['click'],
        },
      },
      {
        description: 'key on input: fires on space key',
        events: {
          input: ['click'],
        },
      },
      {
        description: 'click on label with "id": fires on mouse click',
        events: {
          label: ['mouseup', 'click'],
        },
        id: 'foo',
      },
      {
        description: 'click on input with "id": fires on mouse click',
        events: {
          input: ['click'],
        },
        id: 'foo',
      },
      {
        description: 'key on input with "id": fires on space key',
        events: {
          input: ['click'],
        },
        id: 'foo',
      },
      {
        description: 'click on root: fires on mouse click',
        events: {
          '': ['mouseup', 'click'],
        },
      },
      {
        description: 'click on root with "id": fires on mouse click',
        events: {
          '': ['mouseup', 'click'],
        },
        id: 'foo',
      },
    ]

    assertMatrix.forEach(({ description, events, ...props }) => {
      it(description, () => {
        const dataId = _.uniqueId('checkbox')

        const onClick = sandbox.spy()
        const onChange = sandbox.spy()
        const onParentClick = sandbox.spy()

        const { container } = render(
          <div onClick={onParentClick} role='presentation'>
            <Checkbox {...props} data-id={dataId} onClick={onClick} onChange={onChange} />
          </div>,
        )

        _.forEach(events, (targetEvents, target) => {
          _.forEach(targetEvents, (targetEvent) => {
            const element = container.querySelector(`[data-id=${dataId}] ${target}`)
            if (targetEvent === 'mouseup') {
              fireEvent.mouseUp(element)
            } else if (targetEvent === 'click') {
              fireEvent.click(element)
            }
          })
        })

        onClick.should.have.been.calledOnce()
        onChange.should.have.been.calledOnce()
        onParentClick.should.have.been.calledOnce()

        onChange.should.have.been.calledAfter(onClick)
      })
    })
  })

  describe('Controlled component', () => {
    const getControlledCheckbox = (isOnClick) =>
      class ControlledCheckbox extends React.Component {
        state = { checked: false }
        toggle = () => this.setState((prevState) => ({ checked: !prevState.checked }))

        render() {
          const handler = isOnClick ? { onClick: this.toggle } : { onChange: this.toggle }

          return (
            <Checkbox
              data-checked={this.state.checked}
              label='Check this box'
              checked={this.state.checked}
              {...handler}
            />
          )
        }
      }

    it('toggles state on "change" with "setState" as function', () => {
      const TestComponent = getControlledCheckbox(false)
      const { container } = render(<TestComponent />)

      const input = container.querySelector('input')
      fireEvent.click(input)

      const checkedElement = container.querySelector('[data-checked="true"]')
      expect(checkedElement).toBeFalsy()
    })

    it('toggles state on "click" with "setState" as function', () => {
      const TestComponent = getControlledCheckbox(true)
      const { container } = render(<TestComponent />)

      const input = container.querySelector('input')
      fireEvent.click(input)

      const checkedElement = container.querySelector('[data-checked="true"]')
      expect(checkedElement).toBeFalsy()
    })
  })
})
