import _ from 'lodash'
import faker from 'faker'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Icon from 'src/elements/Icon/Icon'
import Label from 'src/elements/Label/Label'
import LabelDetail from 'src/elements/Label/LabelDetail'
import LabelGroup from 'src/elements/Label/LabelGroup'
import * as common from 'test/specs/commonTests'
import { SUI } from 'src/lib'
import { sandbox } from 'test/utils'
import nestedShallow from 'test/utils/nestedElement'

const hasClass = (element, className) => element.className.split(/\s+/).includes(className)

describe('Label', () => {
  common.isConformant(Label)
  common.forwardsRef(Label)
  common.forwardsRef(Label, { requiredProps: { children: <span /> } })
  common.hasSubcomponents(Label, [LabelDetail, LabelGroup])
  common.hasUIClassName(Label)
  common.rendersChildren(Label)

  common.implementsCreateMethod(Label)
  common.implementsIconProp(Label, { autoGenerateKey: false })
  common.implementsImageProp(Label, { autoGenerateKey: false })
  common.implementsShorthandProp(Label, {
    autoGenerateKey: false,
    propKey: 'detail',
    ShorthandComponent: LabelDetail,
    mapValueToProps: (val) => ({ content: val }),
  })

  common.propKeyAndValueToClassName(Label, 'attached', [
    'top',
    'bottom',
    'top right',
    'top left',
    'bottom left',
    'bottom right',
  ])

  common.propKeyOnlyToClassName(Label, 'active')
  common.propKeyOnlyToClassName(Label, 'basic')
  common.propKeyOnlyToClassName(Label, 'circular')
  common.propKeyOnlyToClassName(Label, 'empty')
  common.propKeyOnlyToClassName(Label, 'floating')
  common.propKeyOnlyToClassName(Label, 'horizontal')
  common.propKeyOnlyToClassName(Label, 'prompt')
  common.propKeyOnlyToClassName(Label, 'tag')

  common.propKeyOrValueAndKeyToClassName(Label, 'corner', ['left', 'right'])
  common.propKeyOrValueAndKeyToClassName(Label, 'ribbon', ['right'])

  common.propValueOnlyToClassName(Label, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Label, 'size', SUI.SIZES)

  it('is a div by default', () => {
    const element = nestedShallow(<Label />)
    expect(element.tagName.toLowerCase()).to.equal('div')
  })

  describe('content', () => {
    it('adds children', () => {
      const text = faker.hacker.phrase()
      const element = nestedShallow(<Label content={text} />)

      expect(element.textContent).to.include(text)
    })
  })

  it('passes the `data-foo` prop', () => {
    const element = nestedShallow(<Label data-foo />)
    expect(element.getAttribute('data-foo')).to.equal('true')
  })

  describe('image', () => {
    it('adds an imageclass when true', () => {
      const element = nestedShallow(<Label image />)
      expect(element).toHaveClass('image')
    })
    it('does not add an Image when true', () => {
      const element = nestedShallow(<Label image />)
      expect(element.querySelector('img')).to.be.null()
    })
  })

  describe('onClick', () => {
    it('is called with (e) when clicked', () => {
      const onClick = sandbox.spy()
      const { container } = render(<Label onClick={onClick} />)

      fireEvent.click(container.firstChild)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({ type: 'click' })
    })
  })

  describe('pointing', () => {
    it('adds an poiting class when true', () => {
      const element = nestedShallow(<Label pointing />)
      expect(element).toHaveClass('pointing')
    })

    it('does not add any poiting option class when true', () => {
      const options = ['above', 'below', 'left', 'right']
      const element = nestedShallow(<Label pointing />)

      options.forEach((className) => expect(hasClass(element, className)).to.equal(false))
    })

    it('adds `above` as suffix', () => {
      const element = nestedShallow(<Label pointing='above' />)
      expect(element).toHaveClass('pointing')
      expect(element).toHaveClass('above')
    })

    it('adds `below` as suffix', () => {
      const element = nestedShallow(<Label pointing='below' />)
      expect(element).toHaveClass('pointing')
      expect(element).toHaveClass('below')
    })

    it('adds `left` as prefix', () => {
      const element = nestedShallow(<Label pointing='left' />)
      expect(element).toHaveClass('left')
      expect(element).toHaveClass('pointing')
    })

    it('adds `right` as prefix', () => {
      const element = nestedShallow(<Label pointing='right' />)
      expect(element).toHaveClass('right')
      expect(element).toHaveClass('pointing')
    })
  })
})
