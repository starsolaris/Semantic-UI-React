import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import AccordionContent from 'src/modules/Accordion/AccordionContent'
import AccordionPanel from 'src/modules/Accordion/AccordionPanel'
import AccordionTitle from 'src/modules/Accordion/AccordionTitle'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'

describe('AccordionPanel', () => {
  common.isConformant(AccordionPanel, { rendersChildren: false, forwardsRef: false })

  common.implementsShorthandProp(AccordionPanel, {
    assertExactMatch: false,
    autoGenerateKey: false,
    parentIsFragment: true,
    propKey: 'content',
    ShorthandComponent: AccordionContent,
    mapValueToProps: (content) => ({ content }),
  })
  common.implementsShorthandProp(AccordionPanel, {
    assertExactMatch: false,
    autoGenerateKey: false,
    parentIsFragment: true,
    propKey: 'title',
    ShorthandComponent: AccordionTitle,
    mapValueToProps: (content) => ({ content }),
  })

  describe('active', () => {
    it('should passed to children', () => {
      const { container } = render(<AccordionPanel active content='Content' title='Title' />)

      const title = container.querySelector('.title')
      const content = container.querySelector('.content')

      expect(title).toHaveClass('active')
      expect(content).toHaveClass('active')
    })
  })

  describe('index', () => {
    it('should passed to title', () => {
      const { container } = render(<AccordionPanel content='Content' index={5} title='Title' />)

      const title = container.querySelector('.title')
      expect(title).toHaveAttribute('data-index', '5')
    })
  })

  describe('onTitleClick', () => {
    it('is called with (e, titleProps) when clicked', () => {
      const event = { target: null }
      const onClick = sandbox.spy()
      const onTitleClick = sandbox.spy()

      const { container } = render(
        <AccordionPanel
          content='Content'
          onTitleClick={onTitleClick}
          title={{ content: 'Title', onClick }}
        />,
      )

      const title = container.querySelector('.title')
      fireEvent.click(title, event)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch(event, { content: 'Title' })

      onTitleClick.should.have.been.calledOnce()
      onTitleClick.should.have.been.calledWithMatch(event, { content: 'Title' })
    })
  })
})
