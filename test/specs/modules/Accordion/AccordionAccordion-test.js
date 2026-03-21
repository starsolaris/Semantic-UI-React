import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'

import AccordionAccordion from 'src/modules/Accordion/AccordionAccordion'
import AccordionContent from 'src/modules/Accordion/AccordionContent'
import AccordionTitle from 'src/modules/Accordion/AccordionTitle'
import * as common from 'test/specs/commonTests'
import { consoleUtil, sandbox } from 'test/utils'

describe('AccordionAccordion', () => {
  common.isConformant(AccordionAccordion)
  common.forwardsRef(AccordionAccordion)
  common.rendersChildren(AccordionAccordion, {
    rendersContent: false,
  })

  common.implementsCreateMethod(AccordionAccordion)

  describe('activeIndex', () => {
    const panels = [
      { key: 'A', title: 'A', content: 'Something A' },
      { key: 'B', title: 'B', content: 'Something B' },
      { key: 'C', title: 'C', content: 'Something C' },
    ]

    it('there is no active items by default', () => {
      const { container } = render(<AccordionAccordion />)
      expect(container.querySelector('.active')).toBeFalsy()
    })

    it('there is no active items by default when "exclusive" is false', () => {
      const { container } = render(<AccordionAccordion exclusive={false} />)
      expect(container.querySelector('.active')).toBeFalsy()
    })

    it('activates an item', () => {
      const { container } = render(<AccordionAccordion activeIndex={0} panels={panels} />)

      const titles = container.querySelectorAll('.title')
      expect(titles[0]).toHaveClass('active')
      expect(titles[1]).not.toHaveClass('active')
      expect(titles[2]).not.toHaveClass('active')
    })

    it('items can be toggled by a click', () => {
      const { container, rerender } = render(<AccordionAccordion panels={panels} />)

      const titles = container.querySelectorAll('.title')
      fireEvent.click(titles[0])
      expect(titles[0]).toHaveClass('active')

      fireEvent.click(titles[0])
      expect(titles[0]).not.toHaveClass('active')
    })

    it('activates a proper item', () => {
      const { container, rerender } = render(<AccordionAccordion activeIndex={0} panels={panels} />)

      rerender(<AccordionAccordion activeIndex={1} panels={panels} />)
      const titles = container.querySelectorAll('.title')
      expect(titles[0]).not.toHaveClass('active')
      expect(titles[1]).toHaveClass('active')
      expect(titles[2]).not.toHaveClass('active')
    })

    it('can activate a single item when "exclusive" is false', () => {
      const { container } = render(
        <AccordionAccordion activeIndex={[0]} exclusive={false} panels={panels} />,
      )

      const titles = container.querySelectorAll('.title')
      expect(titles[0]).toHaveClass('active')
      expect(titles[1]).not.toHaveClass('active')
      expect(titles[2]).not.toHaveClass('active')
    })

    it('can activate multiple items when "exclusive" is false', () => {
      const { container, rerender } = render(
        <AccordionAccordion activeIndex={[0, 1]} exclusive={false} panels={panels} />,
      )

      let titles = container.querySelectorAll('.title')
      expect(titles[0]).toHaveClass('active')
      expect(titles[1]).toHaveClass('active')
      expect(titles[2]).not.toHaveClass('active')

      rerender(<AccordionAccordion activeIndex={[1, 2]} exclusive={false} panels={panels} />)
      titles = container.querySelectorAll('.title')
      expect(titles[0]).not.toHaveClass('active')
      expect(titles[1]).toHaveClass('active')
      expect(titles[2]).toHaveClass('active')
    })

    it('can be inclusive and can open multiple panels by clicking', () => {
      const { container } = render(<AccordionAccordion exclusive={false} panels={panels} />)

      const titles = container.querySelectorAll('.title')
      fireEvent.click(titles[0])
      expect(titles[0]).toHaveClass('active')

      fireEvent.click(titles[1])
      expect(titles[0]).toHaveClass('active')
      expect(titles[1]).toHaveClass('active')
    })

    it('can be inclusive and close multiple panels by clicking', () => {
      const { container } = render(
        <AccordionAccordion defaultActiveIndex={[0, 1]} exclusive={false} panels={panels} />,
      )

      const titles = container.querySelectorAll('.title')
      fireEvent.click(titles[0])
      expect(titles[0]).not.toHaveClass('active')
      expect(titles[1]).toHaveClass('active')

      fireEvent.click(titles[1])
      expect(titles[0]).not.toHaveClass('active')
      expect(titles[1]).not.toHaveClass('active')
    })

    it('warns if is `exclusive` and is given an array', () => {
      consoleUtil.disableOnce()

      const consoleError = sandbox.spy(console, 'error')
      render(<AccordionAccordion exclusive activeIndex={[1]} />)

      consoleError.should.have.been.calledOnce()
    })

    it('warns if not `exclusive` and is given a number', () => {
      consoleUtil.disableOnce()

      const consoleError = sandbox.spy(console, 'error')
      render(<AccordionAccordion exclusive={false} activeIndex={1} />)

      consoleError.should.have.been.calledOnce()
    })
  })

  describe('defaultActiveIndex', () => {
    it('sets the initial activeIndex state', () => {
      const { container } = render(
        <AccordionAccordion
          defaultActiveIndex={1}
          panels={[
            { key: 'A', title: 'A', content: 'Something A' },
            { key: 'B', title: 'B', content: 'Something B' },
          ]}
        />,
      )

      const titles = container.querySelectorAll('.title')
      expect(titles[0]).not.toHaveClass('active')
      expect(titles[1]).toHaveClass('active')
    })
  })

  describe('onTitleClick', () => {
    const event = { target: null }
    const onClick = sandbox.spy()
    const onTitleClick = sandbox.spy()
    const panels = [
      { key: 'A', title: { content: 'A', onClick } },
      { key: 'B', title: 'B' },
    ]

    it('is called with (e, titleProps) when clicked', () => {
      const { container } = render(
        <AccordionAccordion panels={panels} onTitleClick={onTitleClick} />,
      )

      const title = container.querySelectorAll('.title')[0]
      fireEvent.click(title, event)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch(event, { index: 0, content: 'A' })
      onTitleClick.should.have.been.calledOnce()
      onTitleClick.should.have.been.calledWithMatch(event, { index: 0, content: 'A' })
    })
  })

  describe('panels', () => {
    const event = { target: null }
    const onClick = sandbox.spy()

    const panels = [
      {
        key: 'A',
        title: { content: 'A', onClick },
        content: { content: 'Content A', 'data-foo': 'something' },
      },
      { key: 'B', title: 'B', content: { content: 'Content B', 'data-foo': 'something' } },
    ]

    it('renders children', () => {
      const { container } = render(<AccordionAccordion panels={panels} />)

      const titles = container.querySelectorAll('.title')
      const contents = container.querySelectorAll('.content')

      expect(titles[0]).toHaveTextContent('A')
      expect(contents[0]).toHaveTextContent('Content A')

      expect(titles[1]).toHaveTextContent('B')
      expect(contents[1]).toHaveTextContent('Content B')
    })

    it('passes onClick handler', () => {
      const { container } = render(<AccordionAccordion panels={panels} />)

      const title = container.querySelectorAll('.title')[0]
      fireEvent.click(title, event)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch(event, { content: 'A', index: 0 })
    })

    it('passes arbitrary props', () => {
      const { container } = render(<AccordionAccordion panels={panels} />)

      const contents = container.querySelectorAll('.content')
      contents.forEach((content) => {
        expect(content).toHaveAttribute('data-foo', 'something')
      })
    })
  })
})
