import faker from 'faker'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Button from 'src/elements/Button/Button'
import ButtonContent from 'src/elements/Button/ButtonContent'
import ButtonGroup from 'src/elements/Button/ButtonGroup'
import ButtonOr from 'src/elements/Button/ButtonOr'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'
import nestedShallow from 'test/utils/nestedElement'

const syntheticEvent = { preventDefault: () => undefined }

describe('Button', () => {
  common.isConformant(Button)
  common.forwardsRef(Button, { tagName: 'button' })
  common.forwardsRef(Button, { requiredProps: { label: faker.lorem.word() }, tagName: 'button' })
  common.hasSubcomponents(Button, [ButtonContent, ButtonGroup, ButtonOr])
  common.hasUIClassName(Button)
  common.rendersChildren(Button)

  common.implementsCreateMethod(Button)
  common.implementsIconProp(Button, { autoGenerateKey: false })
  common.implementsLabelProp(Button, {
    autoGenerateKey: false,
    shorthandDefaultProps: {
      basic: true,
      pointing: 'left',
    },
  })

  common.propKeyAndValueToClassName(Button, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(Button, 'active')
  common.propKeyOnlyToClassName(Button, 'basic')
  common.propKeyOnlyToClassName(Button, 'circular')
  common.propKeyOnlyToClassName(Button, 'compact')
  common.propKeyOnlyToClassName(Button, 'disabled')
  common.propKeyOnlyToClassName(Button, 'fluid')
  common.propKeyOnlyToClassName(Button, 'inverted')
  common.propKeyOnlyToClassName(Button, 'loading')
  common.propKeyOnlyToClassName(Button, 'primary')
  common.propKeyOnlyToClassName(Button, 'negative')
  common.propKeyOnlyToClassName(Button, 'positive')
  common.propKeyOnlyToClassName(Button, 'secondary')

  common.propKeyOrValueAndKeyToClassName(Button, 'animated', ['fade', 'vertical'])
  common.propKeyOrValueAndKeyToClassName(Button, 'attached', ['left', 'right', 'top', 'bottom'])
  common.propKeyOrValueAndKeyToClassName(Button, 'labelPosition', ['right', 'left'], {
    className: 'labeled',
  })

  common.propValueOnlyToClassName(Button, 'color', [
    ...SUI.COLORS,
    'facebook',
    'twitter',
    'google plus',
    'vk',
    'linkedin',
    'instagram',
    'youtube',
  ])
  common.propValueOnlyToClassName(Button, 'size', SUI.SIZES)

  it('renders a button by default', () => {
    const { container } = render(<Button />)
    expect(container.firstChild.tagName.toLowerCase()).to.equal('button')
  })

  describe('attached', () => {
    it('renders a div', () => {
      const { container } = render(<Button attached />)
      expect(container.firstChild.tagName.toLowerCase()).to.equal('div')
    })
  })

  describe('disabled', () => {
    it('is not set by default', () => {
      const element = nestedShallow(<Button />, { autoNesting: true })
      expect(element.disabled).to.equal(false)
    })

    it('applied when defined', () => {
      const element = nestedShallow(<Button disabled />, { autoNesting: true })
      expect(element.disabled).to.equal(true)
    })

    it("don't apply when the element's type isn't button", () => {
      const element = nestedShallow(<Button as='div' disabled />, { autoNesting: true })
      expect(element.disabled).to.be.undefined()
    })

    it('is not set by default when has a label', () => {
      const { container } = render(<Button label='foo' />)
      const button = container.querySelector('button')
      expect(button.disabled).to.equal(false)
    })

    it('applied when defined and has a label', () => {
      const { container } = render(<Button disabled label='foo' />)
      const button = container.querySelector('button')
      expect(button.disabled).to.equal(true)
    })
  })

  describe('toggle', () => {
    it('is not set by default', () => {
      const element = nestedShallow(<Button />, { autoNesting: true })
      expect(element.toggle).to.be.undefined()
    })

    it('should have aria-pressed', () => {
      const element = nestedShallow(<Button toggle />, { autoNesting: true })
      expect(element.getAttribute('aria-pressed')).to.not.be.null()
    })

    it('aria-pressed should be true when active', () => {
      const element = nestedShallow(<Button toggle active />, { autoNesting: true })
      expect(element.getAttribute('aria-pressed')).to.equal('true')
    })

    it('aria-pressed should be false when inactive', () => {
      const element = nestedShallow(<Button toggle />, { autoNesting: true })
      expect(element.getAttribute('aria-pressed')).to.equal('false')
    })
  })

  describe('icon', () => {
    it('adds className icon', () => {
      const element = nestedShallow(<Button icon='user' />, { autoNesting: true })
      expect(element).toHaveClass('icon')
    })

    it('adds className icon when true', () => {
      const element = nestedShallow(<Button icon />, { autoNesting: true })
      expect(element).toHaveClass('icon')
    })

    it('does not add className icon when there is content', () => {
      let element = nestedShallow(<Button icon='user' content={0} />, { autoNesting: true })
      expect(element).to.not.have.class('icon')

      element = nestedShallow(<Button icon='user' content='Yo' />, { autoNesting: true })
      expect(element).to.not.have.class('icon')
    })

    it('adds className icon given labelPosition and content', () => {
      let element = nestedShallow(
        <Button labelPosition='left' icon='user' content='My Account' />,
        {
          autoNesting: true,
        },
      )
      expect(element).toHaveClass('icon')

      element = nestedShallow(<Button labelPosition='right' icon='user' content='My Account' />, {
        autoNesting: true,
      })
      expect(element).toHaveClass('icon')
    })
  })

  describe('label', () => {
    it('renders as a div', () => {
      const { container } = render(<Button label='http' />)
      expect(container.firstChild.tagName.toLowerCase()).to.equal('div')
    })

    it('renders a div with a button and Label child', () => {
      const { container } = render(<Button label='hi' />)

      expect(container.firstChild.tagName.toLowerCase()).to.equal('div')
      expect(container.querySelectorAll('button').length).to.equal(1)
      expect(container.querySelectorAll('.ui.label').length).to.equal(1)
    })

    it('adds the labeled className to the root element', () => {
      const { container } = render(<Button label='hi' />)
      expect(container.firstChild).toHaveClass('labeled')
    })

    it('contains children without disabled class when disabled attribute is set', () => {
      const { container } = render(<Button label='hi' disabled />)

      expect(container.firstChild).toHaveClass('disabled')
      expect(container.querySelector('.ui.label').className).to.not.include('disabled')
      expect(container.querySelector('button').className).to.not.include('disabled')
    })

    it('contains children without floated class when floated attribute is set', () => {
      const { container } = render(<Button label='hi' floated='left' />)

      expect(container.firstChild).toHaveClass('left floated')
      expect(container.querySelector('.ui.label').className).to.not.include('floated')
      expect(container.querySelector('button').className).to.not.include('floated')
    })

    it('creates a basic pointing label', () => {
      const { container } = render(<Button label='foo' />)
      const label = container.querySelector('.ui.label.basic.pointing')
      expect(label).to.not.be.null()
    })

    it('is before the button and pointing="right" when labelPosition="left"', () => {
      const { container } = render(<Button labelPosition='left' label='foo' />)

      const label = container.querySelector('.ui.label.right.pointing')
      expect(label).to.not.be.null()

      const children = container.firstChild.children
      expect(children[0]).toHaveClass('label')
      expect(children[1].tagName.toLowerCase()).to.equal('button')
    })

    it('is after the button and pointing="left" when labelPosition="right"', () => {
      const { container } = render(<Button labelPosition='right' label='foo' />)

      const label = container.querySelector('.ui.label.left.pointing')
      expect(label).to.not.be.null()

      const children = container.firstChild.children
      expect(children[0].tagName.toLowerCase()).to.equal('button')
      expect(children[1]).toHaveClass('label')
    })

    it('is after the button and pointing="left" by default', () => {
      const { container } = render(<Button label='foo' />)

      const label = container.querySelector('.ui.label.left.pointing')
      expect(label).to.not.be.null()

      const children = container.firstChild.children
      expect(children[0].tagName.toLowerCase()).to.equal('button')
      expect(children[1]).toHaveClass('label')
    })
  })

  describe('labelPosition', () => {
    it('renders as a button when given an icon', () => {
      const { container } = render(<Button labelPosition='left' icon='user' />)
      expect(container.firstChild.tagName.toLowerCase()).to.equal('button')

      const result = render(<Button labelPosition='right' icon='user' />)
      expect(result.container.firstChild.tagName.toLowerCase()).to.equal('button')
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = sandbox.spy()
      const element = nestedShallow(<Button onClick={onClick} />, { autoNesting: true })

      fireEvent.click(element, syntheticEvent)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({ type: 'click' }, { onClick })
    })

    it('is not called when is disabled', () => {
      const onClick = sandbox.spy()
      const { container } = render(<Button disabled onClick={onClick} />)

      fireEvent.click(container.firstChild, syntheticEvent)
      onClick.should.have.callCount(0)
    })
  })

  describe('role', () => {
    it('is not set by default', () => {
      const element = nestedShallow(<Button />, { autoNesting: true })
      expect(element.getAttribute('role')).to.be.null()
    })
    it('defaults to "button" when rendered as not "button" element', () => {
      const element = nestedShallow(<Button as='label' />, { autoNesting: true })
      expect(element.getAttribute('role')).to.equal('button')
    })
    it('is configurable', () => {
      let element = nestedShallow(<Button role='link' />, { autoNesting: true })
      expect(element.getAttribute('role')).to.equal('link')

      element = nestedShallow(<Button role='button' />, { autoNesting: true })
      expect(element.getAttribute('role')).to.equal('button')
    })
  })

  describe('type', () => {
    it('is not set by default', () => {
      const { container } = render(<Button />)
      const button = container.querySelector('button')
      expect(button.getAttribute('type')).to.be.null()
    })

    it('is passed to <button />', () => {
      const { container } = render(<Button type='submit' />)
      const button = container.querySelector('button')
      expect(button.getAttribute('type')).to.equal('submit')
    })

    it('is passed to <button /> when "label" is defined', () => {
      const { container } = render(<Button label='Foo' type='submit' />)
      const button = container.querySelector('button')
      expect(button.getAttribute('type')).to.equal('submit')
    })
  })

  describe('tabIndex', () => {
    it('is not set by default', () => {
      const element = nestedShallow(<Button />, { autoNesting: true })
      expect(element.getAttribute('tabIndex')).to.be.null()
    })
    it('defaults to 0 as div', () => {
      const element = nestedShallow(<Button as='div' />, { autoNesting: true })
      expect(element.tabIndex).to.equal(0)
    })
    it('defaults to -1 when disabled', () => {
      const element = nestedShallow(<Button disabled />, { autoNesting: true })
      expect(element.tabIndex).to.equal(-1)
    })
    it('can be set explicitly', () => {
      const element = nestedShallow(<Button tabIndex={123} />, { autoNesting: true })
      expect(element.tabIndex).to.equal(123)
    })
    it('can be set explicitly when disabled', () => {
      const element = nestedShallow(<Button tabIndex={123} disabled />, { autoNesting: true })
      expect(element.tabIndex).to.equal(123)
    })
  })
})
