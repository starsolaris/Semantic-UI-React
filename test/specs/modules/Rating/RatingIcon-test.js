import keyboardKey from 'keyboard-key'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import RatingIcon from 'src/modules/Rating/RatingIcon'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

describe('RatingIcon', () => {
  common.isConformant(RatingIcon)
  common.forwardsRef(RatingIcon, { tagName: 'i' })

  common.propKeyOnlyToClassName(RatingIcon, 'active')
  common.propKeyOnlyToClassName(RatingIcon, 'selected')

  describe('onClick', () => {
    it('calls onClick with (e, data) when space key is pressed', () => {
      const onClick = sandbox.spy()
      const event = { keyCode: keyboardKey.Spacebar, preventDefault: sandbox.spy() }

      const { container } = render(<RatingIcon index={0} onClick={onClick} />)
      const icon = container.querySelector('i.icon')
      fireEvent.keyUp(icon, event)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch(event, { index: 0 })
      event.preventDefault.should.have.been.calledOnce()
    })

    it('calls onClick with (e, data) when enter key is pressed', () => {
      const onClick = sandbox.spy()
      const event = { keyCode: keyboardKey.Enter, preventDefault: sandbox.spy() }

      const { container } = render(<RatingIcon index={0} onClick={onClick} />)
      const icon = container.querySelector('i.icon')
      fireEvent.keyUp(icon, event)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch(event, { index: 0 })
      event.preventDefault.should.have.been.calledOnce()
    })
  })
})
