import faker from 'faker'
import _ from 'lodash'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import ListItem from 'src/elements/List/ListItem'
import ListContent from 'src/elements/List/ListContent'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'
import nestedShallow from 'test/utils/nestedElement'

const hasClass = (element, className) => element.className.split(/\s+/).includes(className)

describe('ListItem', () => {
  common.isConformant(ListItem)
  common.forwardsRef(ListItem)
  common.forwardsRef(ListItem, { requiredProps: { children: <span /> } })
  common.forwardsRef(ListItem, { requiredProps: { image: '/images/wireframe/image.png' } })
  common.rendersChildren(ListItem)

  common.propKeyOnlyToClassName(ListItem, 'active')
  common.propKeyOnlyToClassName(ListItem, 'disabled')

  describe('as', () => {
    it('omits className `list` when rendered as `li`', () => {
      const element = nestedShallow(<ListItem as='li' />)
      expect(hasClass(element, 'item')).to.equal(false)
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = sandbox.spy()
      const props = { onClick, 'data-foo': 'bar' }
      const { container } = render(<ListItem {...props} />)

      fireEvent.click(container.firstChild)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({ type: 'click' }, props)
    })

    it('is not called when is disabled', () => {
      const onClick = sandbox.spy()
      const { container } = render(<ListItem disabled onClick={onClick} />)

      fireEvent.click(container.firstChild)
      onClick.should.have.callCount(0)
    })
  })

  describe('value', () => {
    it('adds data attribute by default', () => {
      const value = faker.hacker.phrase()
      const element = nestedShallow(<ListItem value={value} />)

      expect(element.getAttribute('data-value')).to.equal(value)
    })

    it('adds attribute when rendered as `li`', () => {
      const value = faker.hacker.phrase()
      const element = nestedShallow(<ListItem as='li' value={value} />)

      expect(element.getAttribute('value')).to.equal(value)
    })
  })

  describe('shorthand', () => {
    const baseProps = {
      content: faker.hacker.phrase(),
      description: faker.hacker.phrase(),
      header: faker.hacker.phrase(),
    }

    it('renders without wrapping ListContent', () => {
      const element = nestedShallow(<ListItem {...baseProps} />)
      const listContent = element.querySelector('.content')

      expect(listContent).to.be.null()
    })

    it('renders without wrapping ListContent when content passed as element', () => {
      const spy = sandbox.spy(ListContent, 'create')
      nestedShallow(<ListItem {...baseProps} content={<div />} />)

      spy.should.not.have.been.called()
    })

    it('renders wrapping ListContent when content passed as props', () => {
      const element = nestedShallow(<ListItem content={baseProps} />)
      const listContent = element.querySelector('.content')

      expect(listContent).to.not.be.null()
    })

    _.each(baseProps, (value, key) => {
      it(`renders wrapping ListContent when icon and ${key} present`, () => {
        const element = nestedShallow(<ListItem {..._.pick(baseProps, key)} icon='user' />)

        expect(element.querySelector('i.icon')).to.not.be.null()
        expect(element.querySelector('.content')).to.not.be.null()
      })

      it(`renders wrapping ListContent when image and ${key} present`, () => {
        const element = nestedShallow(
          <ListItem {..._.pick(baseProps, key)} image='/images/wireframe/image.png' />,
        )

        expect(element.querySelector('img')).to.not.be.null()
        expect(element.querySelector('.content')).to.not.be.null()
      })
    })
  })

  describe('role', () => {
    it('adds role=listitem', () => {
      const element = nestedShallow(<ListItem />)
      expect(element.getAttribute('role')).to.equal('listitem')
    })

    it('adds role=listitem with children', () => {
      const element = nestedShallow(
        <ListItem>
          <div>Test</div>
        </ListItem>,
      )
      expect(element.getAttribute('role')).to.equal('listitem')
    })

    it('adds role=listitem with content', () => {
      const element = nestedShallow(<ListItem content={<div />} />)
      expect(element.getAttribute('role')).to.equal('listitem')
    })

    it('adds role=listitem with icon', () => {
      const element = nestedShallow(<ListItem icon='user' />)
      expect(element.getAttribute('role')).to.equal('listitem')
    })

    it('allows role override without children', () => {
      const element = nestedShallow(<ListItem role='option' />)
      expect(element.getAttribute('role')).to.equal('option')
    })

    it('allows role override with children', () => {
      const element = nestedShallow(
        <ListItem role='option'>
          <div>Test</div>
        </ListItem>,
      )
      expect(element.getAttribute('role')).to.equal('option')
    })

    it('allows role override with content', () => {
      const element = nestedShallow(<ListItem role='option' content={<div />} />)
      expect(element.getAttribute('role')).to.equal('option')
    })

    it('allows role override with icon', () => {
      const element = nestedShallow(<ListItem role='option' icon='user' />)
      expect(element.getAttribute('role')).to.equal('option')
    })
  })
})
