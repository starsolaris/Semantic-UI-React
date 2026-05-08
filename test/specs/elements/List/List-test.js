import faker from 'faker'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import List from 'src/elements/List/List'
import ListContent from 'src/elements/List/ListContent'
import ListDescription from 'src/elements/List/ListDescription'
import ListHeader from 'src/elements/List/ListHeader'
import ListIcon from 'src/elements/List/ListIcon'
import ListItem from 'src/elements/List/ListItem'
import ListList from 'src/elements/List/ListList'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'
import nestedShallow from 'test/utils/nestedElement'

describe('List', () => {
  common.isConformant(List)
  common.forwardsRef(List)
  common.forwardsRef(List, { requiredProps: { children: <span /> } })
  common.forwardsRef(List, { requiredProps: { content: faker.lorem.word() } })
  common.hasSubcomponents(List, [
    ListContent,
    ListDescription,
    ListHeader,
    ListIcon,
    ListItem,
    ListList,
  ])
  common.hasUIClassName(List)
  common.rendersChildren(List)

  common.implementsVerticalAlignProp(List)

  common.propKeyAndValueToClassName(List, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(List, 'animated')
  common.propKeyOnlyToClassName(List, 'bulleted')
  common.propKeyOnlyToClassName(List, 'celled')
  common.propKeyOnlyToClassName(List, 'divided')
  common.propKeyOnlyToClassName(List, 'horizontal')
  common.propKeyOnlyToClassName(List, 'inverted')
  common.propKeyOnlyToClassName(List, 'link')
  common.propKeyOnlyToClassName(List, 'ordered')
  common.propKeyOnlyToClassName(List, 'selection')

  common.propKeyOrValueAndKeyToClassName(List, 'relaxed', ['very'])

  common.propValueOnlyToClassName(List, 'size', SUI.SIZES)

  const items = ['Name', 'Status', 'Notes']

  describe('onItemClick', () => {
    it('is called with (e, itemProps) when clicked', () => {
      const onClick = sandbox.spy()
      const onItemClick = sandbox.spy()

      const callbackData = { content: 'Notes', 'data-foo': 'bar' }
      const itemProps = { key: 'notes', content: 'Notes', 'data-foo': 'bar', onClick }

      const { container } = render(<List items={[itemProps]} onItemClick={onItemClick} />)
      const listItem = container.querySelector('.list > .item')

      fireEvent.click(listItem)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({ type: 'click' }, callbackData)

      onItemClick.should.have.been.calledOnce()
      onItemClick.should.have.been.calledWithMatch({ type: 'click' }, callbackData)
    })
  })

  describe('role', () => {
    it('is accessibile with no items', () => {
      const element = nestedShallow(<List />)
      expect(element.getAttribute('role')).to.equal('list')
    })

    it('is accessibile with items', () => {
      const element = nestedShallow(<List items={items} />)
      expect(element.getAttribute('role')).to.equal('list')
    })

    it('allows overriding with no items', () => {
      const element = nestedShallow(<List role='listbox' />)
      expect(element.getAttribute('role')).to.equal('listbox')
    })

    it('allows overriding with items', () => {
      const element = nestedShallow(<List role='listbox' items={items} />)
      expect(element.getAttribute('role')).to.equal('listbox')
    })

    it('allows overriding with children', () => {
      const element = nestedShallow(
        <List role='listbox'>
          <ListItem />
        </List>,
      )
      expect(element.getAttribute('role')).to.equal('listbox')
    })
  })

  describe('shorthand', () => {
    it('renders empty tr with no shorthand', () => {
      const element = nestedShallow(<List />)
      const listItems = element.querySelectorAll('.item')

      expect(listItems.length).to.equal(0)
    })

    it('renders the items', () => {
      const element = nestedShallow(<List items={items} />)
      const listItems = element.querySelectorAll('.item')

      expect(listItems.length).to.equal(items.length)
    })
  })
})
