import _ from 'lodash'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import { SUI } from 'src/lib'
import Embed from 'src/modules/Embed/Embed'
import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'
import nestedShallow from 'test/utils/nestedShallow'

const assertIframeSrc = (props, srcPart) => {
  const { id = 'default-test-id', source = 'youtube', ...rest } = props

  const { container } = render(<Embed active id={id} source={source} {...rest} />)
  const iframe = container.querySelector('iframe')
  expect(iframe).toBeTruthy()
  expect(iframe.getAttribute('src')).toContain(srcPart)
}

describe('Embed', () => {
  common.isConformant(Embed)
  common.forwardsRef(Embed)
  common.hasUIClassName(Embed)
  common.rendersChildren(Embed, { requiredProps: { active: true } })

  common.implementsHTMLIFrameProp(Embed, {
    alwaysPresent: true,
    assertExactMatch: false,
    autoGenerateKey: false,
    requiredProps: {
      active: true,
      id: 'default-test-id',
      source: 'youtube',
    },
    shorthandDefaultProps: {
      allowFullScreen: false,
      frameBorder: 0,
      height: '100%',
      scrolling: 'no',
      title: 'Embedded content from youtube.',
      width: '100%',
    },
  })
  common.implementsIconProp(Embed, {
    alwaysPresent: true,
    autoGenerateKey: false,
  })

  common.propKeyOnlyToClassName(Embed, 'active')

  common.propValueOnlyToClassName(Embed, 'aspectRatio', ['4:3', '16:9', '21:9'])

  describe('active', () => {
    it('defaults to false', () => {
      const { container } = render(<Embed />)
      expect(container.firstChild.classList.contains('active')).to.equal(false)
    })

    it('applies className', () => {
      const { container } = render(<Embed active />)
      expect(container.firstChild.classList.contains('active')).to.equal(true)
    })
    it('renders nothing when false', () => {
      const { container } = render(
        <Embed>
          <p id='foo' />
        </Embed>,
      )
      expect(container.querySelector('#foo')).toBeFalsy()
    })
  })

  describe('autoplay', () => {
    it('generates url part for source', () => {
      assertIframeSrc({ autoplay: true }, '&amp;autoplay=true')
      assertIframeSrc({ autoplay: false }, '&amp;autoplay=false')
    })
  })

  describe('brandedUI', () => {
    it('generates "modestbranding" url parameter', () => {
      assertIframeSrc({ brandedUI: true }, '&amp;modestbranding=true')
      assertIframeSrc({ brandedUI: false }, '&amp;modestbranding=false')
    })
    it('generates "rel" url parameter', () => {
      assertIframeSrc({ brandedUI: true }, '&amp;rel=0')
      assertIframeSrc({ brandedUI: false }, '&amp;rel=1')
    })
  })

  describe('color', () => {
    it('generates url part for source', () => {
      const color = 'red'
      assertIframeSrc({ color }, `&amp;color=${encodeURIComponent(color)}`)
    })
  })

  describe('defaultActive', () => {
    it('sets the initial active state', () => {
      const { container } = render(<Embed defaultActive />)
      expect(container.firstChild.classList.contains('active')).to.equal(true)
      const { container: c2 } = render(<Embed defaultActive={false} />)
      expect(c2.firstChild.classList.contains('active')).to.equal(false)
    })
  })

  describe('hd', () => {
    it('generates url part for source', () => {
      assertIframeSrc({ hd: true }, '&amp;hq=true')
      assertIframeSrc({ hd: false }, '&amp;hq=false')
    })
  })

  describe('placeholder', () => {
    it('omitted by default', () => {
      const { container } = render(<Embed active id='test' source='youtube' />)
      expect(container.querySelector('img.placeholder')).toBeFalsy()
    })
    it('renders img when defined', () => {
      const url = '/images/wireframe/image.png'
      const { container } = render(<Embed active id='test' placeholder={url} source='youtube' />)
      const img = container.querySelector('img.placeholder')
      expect(img).toBeTruthy()
      expect(img).toHaveAttribute('src', url)
    })
  })

  describe('onClick', () => {
    it('sets to active state', () => {
      const { container } = render(<Embed active={false} id='test' source='youtube' />)
      const wrapper = container.firstChild
      expect(wrapper.classList.contains('active')).to.equal(false)
      fireEvent.click(wrapper)
      expect(wrapper.classList.contains('active')).to.equal(true)
    })

    it('skips state update if active', () => {
      const { container } = render(<Embed active id='test' source='youtube' />)
      const wrapper = container.firstChild
      expect(wrapper.classList.contains('active')).to.equal(true)
      fireEvent.click(wrapper)
      expect(wrapper.classList.contains('active')).to.equal(true)
    })
  })

  describe('source', () => {
    it('generates url for YouTube', () => {
      const id = 'foo'
      assertIframeSrc({ id }, `//www.youtube.com/embed/${id}`)
    })

    it('generates url for Vimeo', () => {
      const id = 'foo'
      assertIframeSrc({ source: 'vimeo', id }, `//player.vimeo.com/video/${id}`)
    })

    it('sets the iframe title', () => {
      const sources = ['youtube', 'vimeo']
      sources.forEach((source) => {
        const { container } = render(<Embed active id='foo' source={source} />)
        const iframe = container.querySelector('iframe')
        expect(iframe).toBeTruthy()
        expect(iframe.getAttribute('title')).to.equal(`Embedded content from ${source}.`)
      })
    })
  })

  describe('url', () => {
    it('passes url to iframe', () => {
      const url = 'https://example.com'
      const { container } = render(<Embed active url={url} />)
      const iframe = container.querySelector('iframe')
      expect(iframe).toBeTruthy()
      expect(iframe).toHaveAttribute('src', url)
    })
  })
})
