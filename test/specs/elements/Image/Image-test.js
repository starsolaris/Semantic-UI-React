import _ from 'lodash'
import faker from 'faker'
import React from 'react'

import Image from 'src/elements/Image/Image'
import ImageGroup from 'src/elements/Image/ImageGroup'
import { htmlImageProps, SUI } from 'src/lib'
import Dimmer from 'src/modules/Dimmer/Dimmer'
import * as common from 'test/specs/commonTests'
import nestedShallow from 'test/utils/nestedElement'

describe('Image', () => {
  common.isConformant(Image)

  common.forwardsRef(Image, { tagName: 'img' })
  common.forwardsRef(Image, {
    requiredProps: { as: 'div', children: <span /> },
    tagName: 'div',
  })
  common.forwardsRef(Image, {
    requiredProps: { as: 'div', content: <span /> },
    tagName: 'div',
  })
  common.forwardsRef(Image, {
    requiredProps: { label: faker.lorem.word() },
    tagName: 'img',
  })

  common.hasSubcomponents(Image, [ImageGroup])
  common.hasUIClassName(Image)
  common.rendersChildren(Image, { requiredProps: { as: 'div' } })

  common.implementsCreateMethod(Image)
  common.implementsLabelProp(Image, { autoGenerateKey: false })
  common.implementsShorthandProp(Image, {
    autoGenerateKey: false,
    propKey: 'dimmer',
    ShorthandComponent: Dimmer,
    mapValueToProps: (val) => ({ content: val }),
  })
  common.implementsVerticalAlignProp(Image)

  common.propKeyAndValueToClassName(Image, 'floated', SUI.FLOATS)

  common.propKeyOnlyToClassName(Image, 'avatar')
  common.propKeyOnlyToClassName(Image, 'bordered')
  common.propKeyOnlyToClassName(Image, 'centered')
  common.propKeyOnlyToClassName(Image, 'circular')
  common.propKeyOnlyToClassName(Image, 'disabled')
  common.propKeyOnlyToClassName(Image, 'fluid')
  common.propKeyOnlyToClassName(Image, 'hidden')
  common.propKeyOnlyToClassName(Image, 'inline')
  common.propKeyOnlyToClassName(Image, 'rounded')

  common.propKeyOrValueAndKeyToClassName(Image, 'spaced', ['left', 'right'])

  common.propValueOnlyToClassName(Image, 'size', SUI.SIZES)

  describe('as', () => {
    it('renders "img" by default', () => {
      const element = nestedShallow(<Image />)
      expect(element.tagName.toLowerCase()).to.equal('img')
    })

    it('renders an a tag', () => {
      const element = nestedShallow(<Image as='a' />)
      expect(element.tagName.toLowerCase()).to.equal('a')
    })

    it('renders a div', () => {
      const element = nestedShallow(<Image as='div' />)
      expect(element.tagName.toLowerCase()).to.equal('div')
    })
  })
})
