import React from 'react'
import { render } from '@testing-library/react'

import MessageList from 'src/collections/Message/MessageList'
import * as common from 'test/specs/commonTests'

describe('MessageList', () => {
  common.isConformant(MessageList)
  common.forwardsRef(MessageList, { tagName: 'ul' })
  common.implementsCreateMethod(MessageList)
  common.rendersChildren(MessageList, {
    rendersContent: false,
  })

  it('renders an ul tag', () => {
    const { container } = render(<MessageList />)
    expect(container.firstChild.tagName).toBe('UL')
  })

  it('has className list', () => {
    const { container } = render(<MessageList />)
    expect(container.firstChild).toHaveClass('list')
  })

  describe('items', () => {
    it('creates MessageItem children', () => {
      const items = ['foo', 'bar', 'baz']
      const { container, getByText } = render(<MessageList items={items} />)

      const listItems = container.querySelectorAll('li')
      expect(listItems).toHaveLength(3)

      items.forEach((item) => {
        expect(getByText(item)).toBeTruthy()
      })
    })
  })
})
