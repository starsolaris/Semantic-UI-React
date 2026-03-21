import _ from 'lodash'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Message from 'src/collections/Message/Message'
import MessageContent from 'src/collections/Message/MessageContent'
import MessageHeader from 'src/collections/Message/MessageHeader'
import MessageList from 'src/collections/Message/MessageList'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

describe('Message', () => {
  common.isConformant(Message)
  common.forwardsRef(Message)
  common.forwardsRef(Message, { requiredProps: { children: <span /> } })
  common.hasSubcomponents(Message, [MessageContent, MessageHeader, MessageList])
  common.hasUIClassName(Message)
  common.rendersChildren(Message, {
    rendersContent: false,
  })

  common.implementsIconProp(Message, { autoGenerateKey: false })
  common.implementsShorthandProp(Message, {
    autoGenerateKey: false,
    propKey: 'content',
    ShorthandComponent: 'p',
    mapValueToProps: (val) => ({ children: val }),
  })
  common.implementsShorthandProp(Message, {
    autoGenerateKey: false,
    propKey: 'header',
    ShorthandComponent: MessageHeader,
    mapValueToProps: (val) => ({ content: val }),
  })
  common.implementsShorthandProp(Message, {
    autoGenerateKey: false,
    propKey: 'list',
    ShorthandComponent: MessageList,
    mapValueToProps: (val) => ({ items: val }),
  })

  common.propKeyOnlyToClassName(Message, 'compact')
  common.propKeyOnlyToClassName(Message, 'error')
  common.propKeyOnlyToClassName(Message, 'floating')
  common.propKeyOnlyToClassName(Message, 'hidden')
  common.propKeyOnlyToClassName(Message, 'icon')
  common.propKeyOnlyToClassName(Message, 'info')
  common.propKeyOnlyToClassName(Message, 'negative')
  common.propKeyOnlyToClassName(Message, 'positive')
  common.propKeyOnlyToClassName(Message, 'success')
  common.propKeyOnlyToClassName(Message, 'visible')
  common.propKeyOnlyToClassName(Message, 'warning')

  common.propKeyOrValueAndKeyToClassName(Message, 'attached', ['bottom', 'top'])

  common.propValueOnlyToClassName(Message, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Message, 'size', _.without(SUI.SIZES, 'medium'))

  describe('header', () => {
    it('adds MessageContent when defined', () => {
      const { container } = render(<Message header='This is a message' />)
      expect(container.querySelector('.content')).toBeTruthy()
    })
  })

  describe('icon', () => {
    it('does not have MessageContent by default', () => {
      const { container } = render(<Message />)
      expect(container.querySelector('.content')).toBeFalsy()
    })
    it('renders children when "true"', () => {
      const text = 'child text'
      const node = <div id='foo' />

      const { container: c1, getByText } = render(<Message icon>{text}</Message>)
      expect(getByText(text)).toBeTruthy()

      const { container: c2 } = render(<Message icon>{node}</Message>)
      expect(c2.querySelector('#foo')).toBeTruthy()
    })
  })

  describe('list', () => {
    it('adds MessageContent when defined', () => {
      const { container } = render(<Message list={[]} />)
      expect(container.querySelector('.content')).toBeTruthy()
    })
  })

  describe('onDismiss', () => {
    it('has no close icon by default', () => {
      const { container } = render(<Message />)
      expect(container.querySelector('.close.icon')).toBeFalsy()
    })

    it('adds a close icon when defined', () => {
      const { container } = render(<Message onDismiss={() => undefined} />)
      expect(container.querySelector('.close.icon')).toBeTruthy()
    })

    it('is called with (event) on close icon click', () => {
      const event = { fake: 'event data' }
      const props = { icon: true }

      const spy = sandbox.spy()
      const { container } = render(<Message {...props} onDismiss={spy} />)

      const closeIcon = container.querySelector('.close.icon')
      fireEvent.click(closeIcon)

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }), props)
    })
  })
})
