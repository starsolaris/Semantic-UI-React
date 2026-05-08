import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Tab from 'src/modules/Tab/Tab'
import TabPane from 'src/modules/Tab/TabPane'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

describe('Tab', () => {
  common.isConformant(Tab)
  common.forwardsRef(Tab)
  common.forwardsRef(Tab, { requiredProps: { menu: { vertical: true } } })
  common.hasSubcomponents(Tab, [TabPane])

  const panes = [
    { menuItem: 'Tab 1', render: () => <Tab.Pane>Tab 1 Content</Tab.Pane> },
    { menuItem: 'Tab 2', render: () => <Tab.Pane>Tab 2 Content</Tab.Pane> },
    { menuItem: 'Tab 3', render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
  ]

  describe('menu', () => {
    it('passes the props to the Menu', () => {
      const { container } = render(<Tab menu={{ 'data-foo': 'bar' }} />)
      const menu = container.querySelector('.menu')
      expect(menu.getAttribute('data-foo')).to.equal('bar')
    })

    it('has an item for every menuItem in panes', () => {
      const { container } = render(<Tab panes={panes} />)
      const items = container.querySelectorAll('.menu .item')

      expect(items.length).to.equal(3)
      expect(items[0].textContent).to.include('Tab 1')
      expect(items[1].textContent).to.include('Tab 2')
      expect(items[2].textContent).to.include('Tab 3')
    })

    it('renders above the pane by default', () => {
      const { container } = render(<Tab panes={panes} />)
      const children = container.firstChild.children

      expect(children[0].classList.contains('menu')).to.be.true()
      expect(children[1].classList.contains('segment')).to.be.true()
    })

    it("renders below the pane when attached='bottom'", () => {
      const { container } = render(<Tab menu={{ attached: 'bottom' }} panes={panes} />)
      const children = container.firstChild.children

      expect(children[0].classList.contains('segment')).to.be.true()
      expect(children[1].classList.contains('menu')).to.be.true()
    })

    it("infers tabular's value from tab's menuPosition if tabular is set to true", () => {
      const menu = { fluid: true, vertical: true, tabular: true }
      const { container } = render(<Tab menu={menu} menuPosition='right' panes={panes} />)

      expect(container.querySelector('.grid')).to.not.be.null()
      expect(container.querySelector('.grid .column:last-child .menu')).to.not.be.null()
      expect(container.querySelector('.menu')).to.have.class('right')
      expect(container.querySelector('.menu')).to.have.class('tabular')
    })

    it("does not infer tabular's value from tab's menuPosition if tabular is explicitly set", () => {
      const menu = { fluid: true, vertical: true, tabular: 'right' }
      const { container } = render(<Tab menu={menu} menuPosition='left' panes={panes} />)

      expect(container.querySelector('.grid')).to.not.be.null()
      expect(container.querySelector('.menu')).to.have.class('right')
      expect(container.querySelector('.menu')).to.have.class('tabular')
    })

    it('renders right when tabular is set to right', () => {
      const menu = { fluid: true, vertical: true, tabular: 'right' }
      const { container } = render(<Tab menu={menu} panes={panes} />)

      expect(container.querySelector('.grid')).to.not.be.null()
      expect(container.querySelector('.menu')).to.not.be.null()
    })
  })

  describe('menuPosition', () => {
    it('renders left of the pane when set left', () => {
      const menu = { fluid: true, vertical: true }
      const { container } = render(<Tab menu={menu} menuPosition='left' panes={panes} />)

      expect(container.querySelector('.grid')).to.not.be.null()
      expect(container.querySelector('.menu')).to.not.be.null()
    })

    it("renders left of the pane when set 'left', even if tabular is right", () => {
      const menu = { fluid: true, vertical: true, tabular: 'right' }
      const { container } = render(<Tab menu={menu} menuPosition='left' panes={panes} />)

      expect(container.querySelector('.grid')).to.not.be.null()
      expect(container.querySelector('.menu')).to.not.be.null()
    })

    it("renders right of the pane when set 'right'", () => {
      const menu = { fluid: true, vertical: true }
      const { container } = render(<Tab menu={menu} menuPosition='right' panes={panes} />)

      expect(container.querySelector('.grid')).to.not.be.null()
      expect(container.querySelector('.menu')).to.not.be.null()
    })
  })

  describe('activeIndex', () => {
    it('is passed to the Menu', () => {
      const { container } = render(<Tab panes={panes} activeIndex={123} />)
      const activeItems = container.querySelectorAll('.menu .active.item')
      expect(activeItems).to.have.length(0)
    })

    it('is set when clicking an item', () => {
      const { container } = render(<Tab panes={panes} />)
      const pane = container.querySelector('.tab.segment')

      expect(pane.textContent).to.include('Tab 1')

      const items = container.querySelectorAll('.menu .item')
      fireEvent.click(items[1])

      expect(container.querySelector('.tab.segment').textContent).to.include('Tab 2 Content')
    })

    it('can be set via props', () => {
      const { container, rerender } = render(<Tab panes={panes} activeIndex={1} />)
      const pane = container.querySelector('.tab.segment')

      expect(pane.textContent).to.include('Tab 2 Content')

      rerender(<Tab panes={panes} activeIndex={2} />)
      expect(container.querySelector('.tab.segment').textContent).to.include('Tab 3 Content')
    })

    it('determines which pane render method is called', () => {
      const activeIndex = 1
      const props = { activeIndex, panes }
      sandbox.spy(panes[activeIndex], 'render')

      render(<Tab {...props} />)

      panes[activeIndex].render.should.have.been.calledOnce()
      panes[activeIndex].render.should.have.been.calledWithMatch(props)
    })
  })

  describe('onTabChange', () => {
    it('is called with (e, { ...props, activeIndex }) a menu item is clicked', () => {
      const activeIndex = 1
      const spy = sandbox.spy()
      const props = { onTabChange: spy, panes }

      const { container } = render(<Tab {...props} />)
      const items = container.querySelectorAll('.menu .item')
      fireEvent.click(items[activeIndex])

      // Since React will have generated a key the returned tab won't match
      // exactly so match on the props instead.
      spy.should.have.been.calledOnce()
      spy.firstCall.args[0].should.have.property('type', 'click')
      spy.firstCall.args[1].should.have.property('activeIndex', 1)
      spy.firstCall.args[1].should.have.property('onTabChange', spy)
      spy.firstCall.args[1].should.have.property('panes', panes)
    })
    it('is called with the new proposed activeIndex, not the current', () => {
      const spy = sandbox.spy()

      const { container } = render(<Tab activeIndex={-1} onTabChange={spy} panes={panes} />)
      const items = container.querySelectorAll('.menu .item')

      spy.should.have.callCount(0)

      fireEvent.click(items[0])
      spy.should.have.callCount(1)
      spy.lastCall.args[1].should.have.property('activeIndex', 0)

      fireEvent.click(items[1])
      spy.should.have.callCount(2)
      spy.lastCall.args[1].should.have.property('activeIndex', 1)

      fireEvent.click(items[2])
      spy.should.have.callCount(3)
      spy.lastCall.args[1].should.have.property('activeIndex', 2)
    })
  })

  describe('renderActiveOnly', () => {
    it('renders all tabs when false', () => {
      const textPanes = [{ pane: 'Tab 1' }, { pane: 'Tab 2' }, { pane: 'Tab 3' }]
      const { container } = render(<Tab panes={textPanes} renderActiveOnly={false} />)
      const panes = container.querySelectorAll('.tab.segment')

      expect(panes.length).to.equal(3)
      expect(panes[0].textContent).to.include('Tab 1')
      expect(panes[1].textContent).to.include('Tab 2')
      expect(panes[2].textContent).to.include('Tab 3')
    })
  })
})
