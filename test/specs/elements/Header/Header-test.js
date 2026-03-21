import faker from 'faker'
import _ from 'lodash'
import React from 'react'

import Header from 'src/elements/Header/Header'
import HeaderContent from 'src/elements/Header/HeaderContent'
import HeaderSubheader from 'src/elements/Header/HeaderSubheader'
import { SUI } from 'src/lib'
import * as common from 'test/specs/commonTests'
import nestedShallow from 'test/utils/nestedShallow'

describe('Header', () => {
  common.hasUIClassName(Header)
  common.forwardsRef(Header, { requiredProps: { children: <span /> } })
  common.forwardsRef(Header, { requiredProps: { icon: 'book' } })
  common.hasSubcomponents(Header, [HeaderContent, HeaderSubheader])
  common.rendersChildren(Header)

  common.implementsIconProp(Header, { autoGenerateKey: false })
  common.implementsImageProp(Header, { autoGenerateKey: false })
  common.implementsShorthandProp(Header, {
    autoGenerateKey: false,
    propKey: 'subheader',
    ShorthandComponent: HeaderSubheader,
    mapValueToProps: (val) => ({ content: val }),
  })
  common.implementsTextAlignProp(Header)

  common.propKeyAndValueToClassName(Header, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(Header, 'block')
  common.propKeyOnlyToClassName(Header, 'disabled')
  common.propKeyOnlyToClassName(Header, 'dividing')
  common.propKeyOnlyToClassName(Header, 'inverted')
  common.propKeyOnlyToClassName(Header, 'sub')

  common.propKeyOrValueAndKeyToClassName(Header, 'attached', ['top', 'bottom'])

  common.propValueOnlyToClassName(Header, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Header, 'size', _.without(SUI.SIZES, 'big', 'massive', 'mini'))

  describe('icon', () => {
    it('adds an icon class when true', () => {
      const element = nestedShallow(<Header icon />)
      expect(element).toHaveClass('icon')
    })
    it('does not add an icon class given a name', () => {
      const element = nestedShallow(<Header icon='user' />)
      expect(element).to.not.have.class('icon')
    })
  })

  describe('image', () => {
    it('adds an image class when true', () => {
      const element = nestedShallow(<Header image />)
      expect(element).toHaveClass('image')
    })
    it('does not add an Image when true', () => {
      const element = nestedShallow(<Header image />)
      expect(element.querySelector('img')).to.be.null()
    })
  })

  describe('content', () => {
    it('is wrapped in HeaderContent when there is an image src', () => {
      const element = nestedShallow(<Header image='/images/wireframe/image.png' content='Bar' />)
      const headerContent = element.querySelector('.content')
      expect(headerContent.textContent).to.include('Bar')
    })
    it('is wrapped in HeaderContent when there is an icon name', () => {
      const element = nestedShallow(<Header icon='users' content='Friends' />)
      const headerContent = element.querySelector('.content')
      expect(headerContent.textContent).to.include('Friends')
    })
    it('is not wrapped in HeaderContent when icon is true', () => {
      const element = nestedShallow(<Header icon content='Friends' />)

      expect(element.textContent).to.include('Friends')
      expect(element.querySelector('.content')).to.be.null()
    })
  })

  describe('subheader', () => {
    it('adds HeaderSubheader as child when there is an icon', () => {
      const text = faker.hacker.phrase()
      const element = nestedShallow(<Header icon='user' subheader={text} />)
      const subheader = element.querySelector('.sub.header')

      expect(subheader.textContent).to.equal(text)
    })
    it('adds HeaderSubheader as child when there is an image', () => {
      const text = faker.hacker.phrase()
      const element = nestedShallow(<Header image='/images/wireframe/image.png' subheader={text} />)
      const subheader = element.querySelector('.sub.header')

      expect(subheader.textContent).to.equal(text)
    })
  })
})
