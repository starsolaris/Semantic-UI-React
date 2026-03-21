import React from 'react'
import { render } from '@testing-library/react'

import FeedExtra from 'src/views/Feed/FeedExtra'
import * as common from 'test/specs/commonTests'

describe('FeedExtra', () => {
  common.isConformant(FeedExtra)
  common.forwardsRef(FeedExtra)
  common.forwardsRef(FeedExtra, { requiredProps: { children: <span /> } })
  common.rendersChildren(FeedExtra)

  common.propKeyOnlyToClassName(FeedExtra, 'images')
  common.propKeyOnlyToClassName(FeedExtra, 'text')

  describe('images', () => {
    it('renders <img> with images prop', () => {
      const { container } = render(<FeedExtra images={['a', 'b', 'c']} />)
      const images = container.querySelectorAll('img')

      expect(images).toHaveLength(3)
    })
  })
})
