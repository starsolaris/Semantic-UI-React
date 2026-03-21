import React from 'react'
import { render } from '@testing-library/react'

import ItemImage from 'src/views/Item/ItemImage'
import * as common from 'test/specs/commonTests'

describe('ItemImage', () => {
  common.isConformant(ItemImage, { rendersChildren: false })
  common.forwardsRef(ItemImage, { tagName: 'img' })
  common.implementsCreateMethod(ItemImage)

  it('renders Image component', () => {
    const { container } = render(<ItemImage />)
    expect(container.querySelector('.image')).toBeTruthy()
  })

  it('is wrapped without ui', () => {
    const { container } = render(<ItemImage />)
    const image = container.querySelector('.image')

    expect(image).toBeTruthy()
  })

  it('has ui with size prop', () => {
    const { container } = render(<ItemImage size='small' />)
    const image = container.querySelector('.image')

    expect(image).toHaveClass('ui')
  })
})
