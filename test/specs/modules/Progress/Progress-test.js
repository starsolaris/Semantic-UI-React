import _ from 'lodash'
import React from 'react'
import { render } from '@testing-library/react'

import { SUI } from 'src/lib'
import Progress from 'src/modules/Progress/Progress'
import * as common from 'test/specs/commonTests'
import nestedShallow from 'test/utils/nestedShallow'

describe('Progress', () => {
  common.isConformant(Progress)
  common.forwardsRef(Progress)
  common.hasUIClassName(Progress)
  common.rendersChildren(Progress)

  common.propKeyAndValueToClassName(Progress, 'attached', ['top', 'bottom'])

  common.propKeyOnlyToClassName(Progress, 'active')
  common.propKeyOnlyToClassName(Progress, 'disabled')
  common.propKeyOnlyToClassName(Progress, 'error')
  common.propKeyOnlyToClassName(Progress, 'indicating')
  common.propKeyOnlyToClassName(Progress, 'inverted')
  common.propKeyOnlyToClassName(Progress, 'success')
  common.propKeyOnlyToClassName(Progress, 'warning')

  common.propValueOnlyToClassName(Progress, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(
    Progress,
    'size',
    _.without(SUI.SIZES, 'mini', 'huge', 'massive'),
  )

  it('contains div with className bar', () => {
    const { container } = render(<Progress />)
    const bar = container.querySelector('.bar')
    expect(bar).toBeTruthy()
    expect(bar.tagName.toLowerCase()).to.equal('div')
  })

  describe('attached', () => {
    it('removes the progress label from the bar', () => {
      const { container } = render(<Progress attached='top' />)
      const progress = container.querySelector('.bar .progress')
      expect(progress).toBeFalsy()
    })
  })

  describe('autoSuccess', () => {
    it('applies the success class when percent >= 100%', () => {
      const { rerender } = render(<Progress autoSuccess percent={100} />)
      expect(document.querySelector('.ui.progress').classList.contains('success')).to.equal(true)

      rerender(<Progress autoSuccess percent={99} />)
      expect(document.querySelector('.ui.progress').classList.contains('success')).to.equal(false)

      rerender(<Progress autoSuccess percent={101} />)
      expect(document.querySelector('.ui.progress').classList.contains('success')).to.equal(true)
    })
    it('applies the success class when value >= total', () => {
      const { rerender } = render(<Progress autoSuccess total={1} value={1} />)
      expect(document.querySelector('.ui.progress').classList.contains('success')).to.equal(true)

      rerender(<Progress autoSuccess total={1} value={0} />)
      expect(document.querySelector('.ui.progress').classList.contains('success')).to.equal(false)

      rerender(<Progress autoSuccess total={1} value={2} />)
      expect(document.querySelector('.ui.progress').classList.contains('success')).to.equal(true)
    })
  })

  describe('bar', () => {
    it('has a width equal to the percent complete', () => {
      const { container } = render(<Progress percent={33.333} />)
      const bar = container.querySelector('.bar')
      expect(bar.style.width).to.equal('33.333%')
    })
    it('cannot have its width set >100%', () => {
      const { container } = render(<Progress percent={101} />)
      const bar = container.querySelector('.bar')
      expect(bar.style.width).to.equal('100%')
    })
    it('cannot have its width set <0%', () => {
      const { container } = render(<Progress percent={-1} />)
      const bar = container.querySelector('.bar')
      expect(bar.style.width).to.equal('0%')
    })
    it('has a width equal to the percentage of the value of the total, when progress="value"', () => {
      const { container } = render(<Progress progress='value' value={5} total={10} />)
      const bar = container.querySelector('.bar')
      expect(bar.style.width).to.equal('50%')
    })
  })

  describe('data-percent', () => {
    it('adds prop by default', () => {
      const { container } = render(<Progress />)
      const wrapper = container.firstChild
      expect(wrapper.hasAttribute('data-percent')).to.equal(true)
    })

    it('passes value of percent prop', () => {
      const { container } = render(<Progress percent={10} />)
      const wrapper = container.firstChild
      expect(wrapper.getAttribute('data-percent')).to.equal('10')
    })

    it('floors the value of percent prop', () => {
      const { container } = render(<Progress percent={8.28} />)
      const wrapper = container.firstChild
      expect(wrapper.getAttribute('data-percent')).to.equal('8')
    })

    it('floors the results value and total props', () => {
      const { container } = render(<Progress value={828} total={10000} />)
      const wrapper = container.firstChild
      expect(wrapper.getAttribute('data-percent')).to.equal('8')
    })
  })

  describe('indicating', () => {
    it('adds the "active" class', () => {
      const { container } = render(<Progress indicating />)
      expect(container.firstChild.classList.contains('active')).to.equal(true)
    })
  })

  describe('label', () => {
    it('shows the label text when provided', () => {
      const { container } = render(<Progress label='some-label' />)
      const label = container.querySelector('.label')
      expect(label).toBeTruthy()
      expect(label.textContent).to.equal('some-label')
    })
  })

  describe('progress', () => {
    it('hides the progress text by default', () => {
      const { container } = render(<Progress />)
      const progress = container.querySelector('.bar .progress')
      expect(progress).toBeFalsy()
    })
    it('shows the progress text when true', () => {
      const { container } = render(<Progress progress />)
      const progressEl = container.querySelector('.bar .progress')
      expect(progressEl).toBeTruthy()
    })
    it('hides the progress text when false', () => {
      const { container } = render(<Progress progress={false} />)
      const progress = container.querySelector('.bar .progress')
      expect(progress).toBeFalsy()
    })
    it('displays the progress as a percentage by default', () => {
      const { container } = render(<Progress percent={20} progress />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('20%')
    })
    it('displays the progress as a ratio when set to "ratio"', () => {
      const { container } = render(<Progress progress='ratio' value={1} total={2} />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('1/2')
    })
    it('displays the progress as a percentage when set to "percent"', () => {
      const { container } = render(<Progress progress='percent' value={1} total={2} />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('50%')
    })
    it('displays the progress as text when set to "value"', () => {
      const { container } = render(<Progress progress='value' value={1} total={2} />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('1')
    })
    it('shows the percent complete', () => {
      const { container } = render(<Progress percent={72} progress />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('72%')
    })
    it('cannot be set >100%', () => {
      const { container } = render(<Progress percent={101} progress />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('100%')
    })
    it('cannot be set <0%', () => {
      const { container } = render(<Progress percent={-1} progress />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('0%')
    })
    it('displays values with a decimal', () => {
      const { container } = render(<Progress percent={10.12345} progress />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('10.12345%')
    })
    it('displays values without a decimal', () => {
      const { container } = render(<Progress percent={35} progress />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('35%')
    })
  })

  describe('precision', () => {
    it('rounds the progress label to 0 decimal places by default', () => {
      const { container } = render(<Progress percent={10.12345} precision={0} />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('10%')
    })
    it('removes the decimal from progress label when set to 0', () => {
      const { container } = render(<Progress percent={10.12345} precision={0} />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('10%')
    })
    it('rounds the decimal in the progress label to the number of digits', () => {
      const { container } = render(<Progress percent={10.12345} precision={1} />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('10.1%')

      const { container: c2 } = render(<Progress percent={10.12345} precision={4} />)
      const progressEl2 = c2.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('10.1235%')
    })
  })

  describe('total/value', () => {
    it('calculates the percent complete', () => {
      const { container } = render(<Progress value={1} total={2} progress />)
      const progressEl = container.querySelector('.progress')
      expect(progressEl).toBeTruthy()
      expect(progressEl.textContent).to.contain('50%')
    })
  })
})