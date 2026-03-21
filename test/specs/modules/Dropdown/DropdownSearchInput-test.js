import faker from 'faker'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import { sandbox } from 'test/utils'
import DropdownSearchInput from 'src/modules/Dropdown/DropdownSearchInput'

describe('DropdownSearchInput', () => {
  common.isConformant(DropdownSearchInput)
  common.forwardsRef(DropdownSearchInput, { tagName: 'input' })

  describe('aria', () => {
    it('should have aria-autocomplete', () => {
      const { container } = render(<DropdownSearchInput />)
      expect(container.firstChild).toHaveAttribute('aria-autocomplete', 'list')
    })
  })

  describe('autoComplete', () => {
    it('should have autoComplete by default', () => {
      const { container } = render(<DropdownSearchInput />)
      expect(container.firstChild).toHaveAttribute('autoComplete', 'off')
    })

    it('should pass a defined value', () => {
      const { container } = render(<DropdownSearchInput autoComplete='on' />)
      expect(container.firstChild).toHaveAttribute('autoComplete', 'on')
    })
  })

  describe('onChange', () => {
    it('is called with (e, data) on change', () => {
      const onChange = sandbox.spy()
      const e = { target: { value: 'value' } }

      const { container } = render(<DropdownSearchInput onChange={onChange} />)
      fireEvent.change(container.firstChild, e)

      onChange.should.have.been.calledOnce()
      onChange.should.have.been.calledWithMatch(e, { value: e.target.value })
    })
  })

  describe('tabIndex', () => {
    it('is not set by default', () => {
      const { container } = render(<DropdownSearchInput />)
      expect(container.firstChild).not.toHaveAttribute('tabIndex')
    })

    it('can be set explicitly', () => {
      const { container } = render(<DropdownSearchInput tabIndex={123} />)
      expect(container.firstChild).toHaveAttribute('tabIndex', '123')
    })
  })

  describe('type', () => {
    it('should have text by default', () => {
      const { container } = render(<DropdownSearchInput />)
      expect(container.firstChild).toHaveAttribute('type', 'text')
    })

    it('can be set explicitly', () => {
      const type = faker.random.word()
      const { container } = render(<DropdownSearchInput type={type} />)
      expect(container.firstChild).toHaveAttribute('type', type)
    })
  })

  describe('value', () => {
    it('is not set by default', () => {
      const { container } = render(<DropdownSearchInput />)
      expect(container.firstChild).not.toHaveAttribute('value')
    })

    it('can be set explicitly', () => {
      const value = faker.random.word()
      const { container } = render(<DropdownSearchInput value={value} />)
      expect(container.firstChild).toHaveAttribute('value', value)
    })
  })
})
