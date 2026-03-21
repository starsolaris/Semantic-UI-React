import faker from 'faker'
import _ from 'lodash'
import React from 'react'
import { render } from '@testing-library/react'

import StepGroup from 'src/elements/Step/StepGroup'
import { numberToWordMap } from 'src/lib'
import * as common from 'test/specs/commonTests'

const numberMap = _.pickBy(numberToWordMap, (val, key) => key <= 8)

describe('StepGroup', () => {
  common.isConformant(StepGroup)
  common.forwardsRef(StepGroup)
  common.forwardsRef(StepGroup, { requiredProps: { content: faker.lorem.word() } })
  common.forwardsRef(StepGroup, { requiredProps: { children: <span /> } })
  common.hasUIClassName(StepGroup)
  common.rendersChildren(StepGroup)

  common.implementsWidthProp(
    StepGroup,
    [..._.keys(numberMap), ..._.keys(numberMap).map(Number), ..._.values(numberMap)],
    {
      canEqual: false,
      propKey: 'widths',
    },
  )

  common.propKeyAndValueToClassName(StepGroup, 'stackable', ['tablet'])

  common.propKeyOnlyToClassName(StepGroup, 'fluid')
  common.propKeyOnlyToClassName(StepGroup, 'ordered')
  common.propKeyOnlyToClassName(StepGroup, 'vertical')

  common.propKeyOrValueAndKeyToClassName(StepGroup, 'attached', ['top', 'bottom'])

  describe('items', () => {
    it('renders children', () => {
      const { container } = render(<StepGroup items={['foo', 'bar']} />)
      const steps = container.querySelectorAll('.step')

      expect(steps.length).to.equal(2)
      expect(steps[0].textContent).to.include('foo')
      expect(steps[1].textContent).to.include('bar')
    })
  })
})
