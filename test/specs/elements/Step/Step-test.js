import faker from 'faker'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Step from 'src/elements/Step/Step'
import StepContent from 'src/elements/Step/StepContent'
import StepDescription from 'src/elements/Step/StepDescription'
import StepTitle from 'src/elements/Step/StepTitle'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

describe('Step', () => {
  common.isConformant(Step)
  common.forwardsRef(Step)
  common.forwardsRef(Step, { requiredProps: { content: faker.lorem.word() } })
  common.forwardsRef(Step, { requiredProps: { content: <span /> } })
  common.hasSubcomponents(Step, [StepContent, StepDescription, StepTitle])
  common.rendersChildren(Step)

  common.implementsIconProp(Step, { autoGenerateKey: false })

  common.propKeyOnlyToClassName(Step, 'active')
  common.propKeyOnlyToClassName(Step, 'completed')
  common.propKeyOnlyToClassName(Step, 'disabled')
  common.propKeyOnlyToClassName(Step, 'link')

  it('renders as a div by default', () => {
    const { container } = render(<Step />)
    expect(container.firstChild.tagName.toLowerCase()).to.equal('div')
  })

  describe('children', () => {
    it('does not have StepContent when children are provided', () => {
      const { container } = render(<Step>{faker.hacker.phrase()}</Step>)
      expect(container.querySelector('.step-content')).to.be.null()
    })
  })

  describe('description', () => {
    it('passes prop to StepContent', () => {
      const description = faker.hacker.phrase()

      const { container } = render(<Step description={description} />)
      const stepContent = container.querySelector('.step-content')
      expect(stepContent.textContent).to.include(description)
    })
  })

  describe('href', () => {
    it('renders as `a` when defined', () => {
      const url = faker.internet.url()
      const { container } = render(<Step href={url} />)

      expect(container.firstChild.tagName.toLowerCase()).to.equal('a')
      expect(container.firstChild.getAttribute('href')).to.equal(url)
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const event = { target: null }
      const onClick = sandbox.spy()

      const { container } = render(<Step onClick={onClick} />)
      fireEvent.click(container.firstChild, event)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch(event, { onClick })
    })

    it('is not called when is disabled', () => {
      const onClick = sandbox.spy()

      const { container } = render(<Step disabled onClick={onClick} />)
      fireEvent.click(container.firstChild)
      onClick.should.have.not.been.called()
    })

    it('renders as `a` when defined', () => {
      const { container } = render(<Step onClick={() => null} />)
      expect(container.firstChild.tagName.toLowerCase()).to.equal('a')
    })
  })

  describe('title', () => {
    it('passes prop to StepContent', () => {
      const title = faker.hacker.phrase()

      const { container } = render(<Step title={title} />)
      const stepContent = container.querySelector('.step-content')
      expect(stepContent.textContent).to.include(title)
    })
  })
})
