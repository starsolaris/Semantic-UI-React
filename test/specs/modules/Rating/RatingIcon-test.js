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
      const event = { keyCode: keyboardKey.Spacebar }

      const { container } = render(<RatingIcon index={0} onClick={onClick} />)
      const icon = container.querySelector('i.icon')
      fireEvent.keyUp(icon, event)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({ keyCode: keyboardKey.Spacebar }, { index: 0 })
      expect(onClick.firstCall.args[0].defaultPrevented).to.equal(true)
    })

    it('calls onClick with (e, data) when enter key is pressed', () => {
      const onClick = sandbox.spy()
      const event = { keyCode: keyboardKey.Enter }

      const { container } = render(<RatingIcon index={0} onClick={onClick} />)
      const icon = container.querySelector('i.icon')
      fireEvent.keyUp(icon, event)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({ keyCode: keyboardKey.Enter }, { index: 0 })
      expect(onClick.firstCall.args[0].defaultPrevented).to.equal(true)
    })
  })
})
