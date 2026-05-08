import _ from 'lodash'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Menu from 'src/collections/Menu/Menu'
import MenuItem from 'src/collections/Menu/MenuItem'
import MenuHeader from 'src/collections/Menu/MenuHeader'
import MenuMenu from 'src/collections/Menu/MenuMenu'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

describe('Menu', () => {
  common.isConformant(Menu)
  common.hasSubcomponents(Menu, [MenuHeader, MenuItem, MenuMenu])
  common.hasUIClassName(Menu)
  common.rendersChildren(Menu, {
    rendersContent: false,
  })

  common.implementsWidthProp(Menu, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'widths',
  })

  common.propKeyAndValueToClassName(Menu, 'fixed', ['left', 'right', 'bottom', 'top'])

  common.propKeyOnlyToClassName(Menu, 'borderless')
  common.propKeyOnlyToClassName(Menu, 'compact')
  common.propKeyOnlyToClassName(Menu, 'fluid')
  common.propKeyOnlyToClassName(Menu, 'inverted')
  common.propKeyOnlyToClassName(Menu, 'pagination')
  common.propKeyOnlyToClassName(Menu, 'pointing')
  common.propKeyOnlyToClassName(Menu, 'secondary')
  common.propKeyOnlyToClassName(Menu, 'stackable')
  common.propKeyOnlyToClassName(Menu, 'text')
  common.propKeyOnlyToClassName(Menu, 'vertical')

  common.propKeyOrValueAndKeyToClassName(Menu, 'attached', ['top', 'bottom'])
  common.propKeyOrValueAndKeyToClassName(Menu, 'floated', ['right'])
  common.propKeyOrValueAndKeyToClassName(Menu, 'icon', ['labeled'])
  common.propKeyOrValueAndKeyToClassName(Menu, 'tabular', ['right'])

  common.propValueOnlyToClassName(Menu, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Menu, 'size', _.without(SUI.SIZES, 'medium', 'big'))

  it('renders a `div` by default', () => {
    const { container } = render(<Menu />)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  describe('activeIndex', () => {
    const items = [
      { key: 'home', name: 'home' },
      { key: 'users', name: 'users' },
    ]

    it('is null by default', () => {
      const { container } = render(<Menu items={items} />)
      expect(container.querySelector('.active')).toBeFalsy()
    })

    it('is set when clicking an item', () => {
      const { container } = render(<Menu items={items} />)
      const menuItems = container.querySelectorAll('.item')

      fireEvent.click(menuItems[1])

      expect(menuItems[1]).toHaveClass('active')
    })

    it('works as a string', () => {
      const { container } = render(<Menu items={items} activeIndex={1} />)
      expect(container.querySelectorAll('.item')[1]).toHaveClass('active')
    })
  })

  describe('items', () => {
    const spy = sandbox.spy()
    const items = [
      { key: 'home', name: 'home', onClick: spy, 'data-foo': 'something' },
      { key: 'users', name: 'users', active: true, 'data-foo': 'something' },
    ]

    it('renders children', () => {
      const { container } = render(<Menu items={items} />)
      const menuItems = container.querySelectorAll('.item')

      expect(menuItems[0]).toHaveTextContent('Home')
      expect(menuItems[1]).toHaveTextContent('Users')
    })

    it('onClick can omitted', () => {
      const { container } = render(<Menu items={items} />)
      const click = () => fireEvent.click(container.querySelectorAll('.item')[1])
      expect(click).to.not.throw()
    })

    it('passes onClick handler', () => {
      const { container } = render(<Menu items={items} />)
      const props = { name: 'home', index: 0 }

      fireEvent.click(container.querySelectorAll('.item')[0])

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch({ type: 'click' }, props)
    })

    it('passes arbitrary props', () => {
      const { container } = render(<Menu items={items} />)
      const menuItems = container.querySelectorAll('.item')

      menuItems.forEach((item) => {
        expect(item.getAttribute('data-foo')).toBe('something')
      })
    })
  })

  describe('onItemClick', () => {
    it('is called with (e, { name, index }) when clicked', () => {
      const onClick = sandbox.spy()
      const onItemClick = sandbox.spy()

      const items = [
        { key: 'home', name: 'home' },
        { key: 'users', name: 'users', onClick },
      ]
      const matchProps = { index: 1, name: 'users' }

      const { container } = render(<Menu items={items} onItemClick={onItemClick} />)

      fireEvent.click(container.querySelectorAll('.item')[1])

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({ type: 'click' }, matchProps)
      onItemClick.should.have.been.calledOnce()
      onItemClick.should.have.been.calledWithMatch({ type: 'click' }, matchProps)
    })
  })
})
