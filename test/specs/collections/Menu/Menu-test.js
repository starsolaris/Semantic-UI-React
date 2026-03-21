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
      const { container, getAllByRole } = render(<Menu items={items} />)

      fireEvent.click(getAllByRole('menuitem')[1])

      expect(getAllByRole('menuitem')[1]).toHaveClass('active')
    })

    it('works as a string', () => {
      const { getAllByRole } = render(<Menu items={items} activeIndex={1} />)
      expect(getAllByRole('menuitem')[1]).toHaveClass('active')
    })
  })

  describe('items', () => {
    const spy = sandbox.spy()
    const items = [
      { key: 'home', name: 'home', onClick: spy, 'data-foo': 'something' },
      { key: 'users', name: 'users', active: true, 'data-foo': 'something' },
    ]

    it('renders children', () => {
      const { getAllByRole } = render(<Menu items={items} />)
      const menuItems = getAllByRole('menuitem')

      expect(menuItems[0]).toHaveTextContent('Home')
      expect(menuItems[1]).toHaveTextContent('Users')
    })

    it('onClick can omitted', () => {
      const { getAllByRole } = render(<Menu items={items} />)
      const click = () => fireEvent.click(getAllByRole('menuitem')[1])
      expect(click).not.toThrow()
    })

    it('passes onClick handler', () => {
      const { getAllByRole } = render(<Menu items={items} />)
      const event = { target: null }
      const props = { name: 'home', index: 0 }

      fireEvent.click(getAllByRole('menuitem')[0], event)

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }), props)
    })

    it('passes arbitrary props', () => {
      const { getAllByRole } = render(<Menu items={items} />)
      const menuItems = getAllByRole('menuitem')

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

      const { getAllByRole } = render(<Menu items={items} onItemClick={onItemClick} />)

      fireEvent.click(getAllByRole('menuitem')[1])

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }), matchProps)
      expect(onItemClick).toHaveBeenCalledOnce()
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'click' }),
        matchProps,
      )
    })
  })
})
