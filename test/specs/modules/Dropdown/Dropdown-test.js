import _ from 'lodash'
import faker from 'faker'
import React, { act } from 'react'
import { render, fireEvent } from '@testing-library/react'

import * as common from 'test/specs/commonTests'
import { consoleUtil, domEvent, mount, sandbox } from 'test/utils'
import Icon from 'src/elements/Icon/Icon'
import Label from 'src/elements/Label/Label'
import Dropdown from 'src/modules/Dropdown/Dropdown'
import DropdownDivider from 'src/modules/Dropdown/DropdownDivider'
import DropdownHeader from 'src/modules/Dropdown/DropdownHeader'
import DropdownItem from 'src/modules/Dropdown/DropdownItem'
import DropdownMenu from 'src/modules/Dropdown/DropdownMenu'
import DropdownSearchInput from 'src/modules/Dropdown/DropdownSearchInput'
import DropdownText from 'src/modules/Dropdown/DropdownText'

let attachTo
let options
let container
let wrapper

// ----------------------------------------
// Wrapper
// ----------------------------------------
// we need to unmount the dropdown after every test to ensure all event listeners are cleaned up
// wrap the render methods to update a global container that is unmounted after each test
const wrapperMount = (node, opts) => {
  attachTo = document.createElement('div')
  document.body.appendChild(attachTo)

  wrapper = mount(node, { ...opts, container: attachTo })
  container = attachTo
  return wrapper
}

const dropdownRoot = () => container.firstChild

const dropdownInput = () => container.querySelector('input.search')

const clickDropdown = (eventData) => fireEvent.click(dropdownRoot(), eventData)

const focusDropdown = (eventData) => fireEvent.focus(dropdownRoot(), eventData)

const blurDropdown = (eventData) => fireEvent.blur(dropdownRoot(), eventData)

// ----------------------------------------
// Options
// ----------------------------------------
const getOptions = (count = 5) =>
  _.times(count, (i) => {
    const text = [i, ..._.times(3, faker.hacker.noun)].join(' ')
    const value = _.snakeCase(text)
    return { text, value }
  })

// -------------------------------
// Common Assertions
// -------------------------------
const dropdownMenuIsClosed = () => {
  expect(container.firstChild.className).to.not.include('visible')

  const menu = container.querySelector('.menu')

  expect(menu.className).to.not.include('visible')
}

function bodyIsFocused() {
  const isFocused = document.activeElement === document.body

  isFocused.should.be.true(
    `Expected Dropdown to be the active element but found ${document.activeElement} instead.`,
  )
}

function dropdownIsFocused() {
  const isFocused = document.activeElement === document.querySelector('div.dropdown')

  isFocused.should.be.true(
    `Expected Dropdown to be the active element but found ${document.activeElement} instead.`,
  )
}

function dropdownInputIsFocused() {
  const isFocused = document.activeElement === document.querySelector('input.search')

  isFocused.should.be.true(
    `Expected DropdownSearchInput to be the active element but found ${document.activeElement} instead.`,
  )
}

const dropdownMenuIsOpen = () => {
  expect(container.firstChild.className).to.include('active')
  expect(container.firstChild.className).to.include('visible')

  const menu = container.querySelector('.menu')

  expect(menu.className).to.include('visible')
}

const nativeEvent = { nativeEvent: { stopImmediatePropagation: _.noop } }

describe('Dropdown', () => {
  beforeEach(() => {
    attachTo = undefined
    wrapper = undefined
    options = getOptions()
  })

  afterEach(() => {
    if (wrapper && wrapper.unmount) wrapper.unmount()
    if (attachTo) document.body.removeChild(attachTo)
  })

  common.isConformant(Dropdown)
  common.forwardsRef(Dropdown)
  common.hasUIClassName(Dropdown)
  common.hasSubcomponents(Dropdown, [
    DropdownDivider,
    DropdownHeader,
    DropdownItem,
    DropdownMenu,
    DropdownSearchInput,
    DropdownText,
  ])

  common.implementsIconProp(Dropdown, {
    defaultValue: 'search',
    assertExactMatch: false,
    autoGenerateKey: false,
  })
  common.implementsShorthandProp(Dropdown, {
    autoGenerateKey: false,
    propKey: 'header',
    ShorthandComponent: DropdownHeader,
    mapValueToProps: (val) => ({ content: val }),
  })

  common.propKeyOnlyToClassName(Dropdown, 'disabled')
  common.propKeyOnlyToClassName(Dropdown, 'error')
  common.propKeyOnlyToClassName(Dropdown, 'loading')
  common.propKeyOnlyToClassName(Dropdown, 'basic')
  common.propKeyOnlyToClassName(Dropdown, 'button')
  common.propKeyOnlyToClassName(Dropdown, 'compact')
  common.propKeyOnlyToClassName(Dropdown, 'fluid')
  common.propKeyOnlyToClassName(Dropdown, 'floating')
  common.propKeyOnlyToClassName(Dropdown, 'inline')
  // TODO: See Dropdown cx notes
  // common.propKeyOnlyToClassName(Dropdown, 'icon')
  common.propKeyOnlyToClassName(Dropdown, 'labeled')
  common.propKeyOnlyToClassName(Dropdown, 'item')
  common.propKeyOnlyToClassName(Dropdown, 'multiple')
  common.propKeyOnlyToClassName(Dropdown, 'search')
  common.propKeyOnlyToClassName(Dropdown, 'selection')
  common.propKeyOnlyToClassName(Dropdown, 'simple')
  common.propKeyOnlyToClassName(Dropdown, 'scrolling')
  common.propKeyOnlyToClassName(Dropdown, 'upward')

  common.propKeyOrValueAndKeyToClassName(Dropdown, 'pointing', [
    'left',
    'right',
    'top',
    'top left',
    'top right',
    'bottom',
    'bottom left',
    'bottom right',
  ])

  describe('defaultSearchQuery', () => {
    it('changes default value of searchQuery', () => {
      wrapperMount(<Dropdown defaultSearchQuery='foo' search />)
      expect(dropdownInput().value).to.equal('foo')
    })
  })

  it('closes on blur', () => {
    wrapperMount(<Dropdown options={options} />)
    clickDropdown()

    dropdownMenuIsOpen()
    blurDropdown()
    dropdownMenuIsClosed()
  })

  it('does not close on blur with closeOnBlur set to false', () => {
    wrapperMount(<Dropdown options={options} closeOnBlur={false} />)
    clickDropdown()

    dropdownMenuIsOpen()
    blurDropdown()
    dropdownMenuIsOpen()
  })

  // TODO: find a way to test this in a different way
  // it('blurs the Dropdown node on close', () => {
  //   wrapperMount(<Dropdown options={options} selection defaultOpen />)
  //
  //   const instance = wrapper.instance()
  //   sandbox.spy(instance.ref.current, 'blur')
  //
  //   dropdownMenuIsOpen()
  //   wrapper.simulate('click')
  //   dropdownMenuIsClosed()
  //
  //   instance.ref.current.blur.should.have.been.calledOnce()
  // })
  //
  // it('blurs the Dropdown node on close by clicking outside component', () => {
  //   wrapperMount(<Dropdown options={options} selection defaultOpen />)
  //
  //   const instance = wrapper.instance()
  //   sandbox.spy(instance.ref.current, 'blur')
  //
  //   dropdownMenuIsOpen()
  //   document.body.click()
  //   dropdownMenuIsClosed()
  //
  //   instance.ref.current.blur.should.have.been.calledOnce()
  // })
  //
  // it('does not close on click when search is true and options are empty', () => {
  //   wrapperMount(<Dropdown options={[]} search selection defaultOpen />)
  //
  //   const instance = wrapper.instance()
  //   sandbox.spy(instance.ref.current, 'blur')
  //
  //   dropdownMenuIsOpen()
  //   wrapper.simulate('click')
  //   dropdownMenuIsOpen()
  // })

  it('opens on focus', () => {
    wrapperMount(<Dropdown options={options} />)

    dropdownMenuIsClosed()
    focusDropdown()
    dropdownMenuIsOpen()
  })

  describe('disabled', () => {
    it('does not open on click', () => {
      wrapperMount(<Dropdown options={options} disabled />)

      dropdownMenuIsClosed()
      clickDropdown()
      dropdownMenuIsClosed()
    })

    it('does not open on click with pointer events enabled', () => {
      wrapperMount(<Dropdown options={options} disabled style={{ pointerEvents: 'all' }} />)

      dropdownMenuIsClosed()
      clickDropdown()
      dropdownMenuIsClosed()
    })

    it('does not open on focus', () => {
      wrapperMount(<Dropdown options={options} disabled />)

      dropdownMenuIsClosed()
      focusDropdown()
      dropdownMenuIsClosed()
    })
  })

  describe('tabIndex', () => {
    it('defaults to 0', () => {
      wrapperMount(<Dropdown options={options} />)

      expect(container.firstChild.getAttribute('tabIndex')).to.equal('0')
    })

    it('defaults to -1 when disabled', () => {
      wrapperMount(<Dropdown disabled options={options} />)

      expect(container.firstChild.getAttribute('tabIndex')).to.equal('-1')
    })

    it('applies when defined', () => {
      wrapperMount(<Dropdown options={options} tabIndex={1} />)

      expect(container.firstChild.getAttribute('tabIndex')).to.equal('1')
    })

    describe('search', () => {
      it('defaults the search input to 0', () => {
        wrapperMount(<Dropdown options={options} selection search />)

        const input = container.querySelector('input.search')
        expect(input.tabIndex).to.equal(0)
      })

      it('defaults the disabled search input to -1', () => {
        wrapperMount(<Dropdown disabled options={options} selection search />)

        const input = container.querySelector('input.search')
        expect(input.tabIndex).to.equal(-1)
      })

      it('allows explicitly setting the search input value', () => {
        wrapperMount(<Dropdown options={options} selection search tabIndex={123} />)

        const input = container.querySelector('input.search')
        expect(input.tabIndex).to.equal(123)
      })

      it('allows explicitly setting the search input value when disabled', () => {
        wrapperMount(<Dropdown disabled options={options} selection search tabIndex={123} />)

        const input = container.querySelector('input.search')
        expect(input.tabIndex).to.equal(123)
      })

      it('is not present on the root when is search', () => {
        wrapperMount(<Dropdown options={options} selection search />)

        expect(container.firstChild.hasAttribute('tabIndex')).to.be.false()
      })

      it('is not present on the root when is search and defined', () => {
        wrapperMount(<Dropdown options={options} selection search tabIndex={1} />)

        expect(container.firstChild.hasAttribute('tabIndex')).to.be.false()
      })
    })
  })

  describe('aria', () => {
    it('should label normal dropdown as a listbox', () => {
      wrapperMount(<Dropdown />)
      expect(container.querySelector('div').getAttribute('role')).to.equal('listbox')
    })
    it('should label search dropdown as a combobox', () => {
      wrapperMount(<Dropdown search />)
      expect(container.querySelector('div').getAttribute('role')).to.equal('combobox')
    })
    it('should label search dropdownMenu as a listbox', () => {
      wrapperMount(<Dropdown search />)
      const menu = container.querySelector('.menu')
      expect(menu.getAttribute('role')).to.equal('listbox')
    })
    it('should label search multiple dropdownMenu as aria-multiselectable', () => {
      wrapperMount(<Dropdown search multiple />)
      const menu = container.querySelector('.menu')
      expect(menu.getAttribute('aria-multiselectable')).to.equal('true')
    })
    it('should not label normal dropdownMenu with a role', () => {
      wrapperMount(<Dropdown />)
      const menu = container.querySelector('.menu')
      expect(menu.hasAttribute('role')).to.be.false()
    })
    it('should label disabled dropdown as aria-disabled', () => {
      wrapperMount(<Dropdown disabled />)
      expect(container.querySelector('div').getAttribute('aria-disabled')).to.equal('true')
    })
    it('should label normal dropdown without aria-disabled', () => {
      wrapperMount(<Dropdown />)
      expect(container.querySelector('div').hasAttribute('aria-disabled')).to.be.false()
    })
    it('should label multiple dropdown as aria-multiselectable', () => {
      wrapperMount(<Dropdown multiple />)
      expect(container.querySelector('div').getAttribute('aria-multiselectable')).to.equal('true')
    })
    it('should not label multiple search dropdown as aria-multiselectable', () => {
      wrapperMount(<Dropdown search multiple />)
      expect(container.querySelector('div').hasAttribute('aria-multiselectable')).to.be.false()
    })
    it('should label normal dropdown without aria-multiselectable', () => {
      wrapperMount(<Dropdown />)
      expect(container.querySelector('div').hasAttribute('aria-multiselectable')).to.be.false()
    })
    it('should label loading dropdown as aria-busy', () => {
      wrapperMount(<Dropdown loading />)
      expect(container.querySelector('div').getAttribute('aria-busy')).to.equal('true')
    })
    it('should label normal dropdown without aria-busy', () => {
      wrapperMount(<Dropdown />)
      expect(container.querySelector('div').hasAttribute('aria-busy')).to.be.false()
    })
    it('should label search dropdown input aria-autocomplete=list', () => {
      wrapperMount(<Dropdown search />)
      const input = container.querySelector('input')
      expect(input.getAttribute('aria-autocomplete')).to.equal('list')
    })
    it('should label search dropdown input type=text', () => {
      wrapperMount(<Dropdown search />)
      const input = container.querySelector('input')
      expect(input.getAttribute('type')).to.equal('text')
    })
  })

  describe('clearable', () => {
    it('does not clear when value is empty', () => {
      const onChange = sandbox.spy()
      wrapperMount(<Dropdown clearable onChange={onChange} />)

      const icon = container.querySelector('i.icon')
      fireEvent.click(icon, { stopPropagation: _.noop })
      onChange.should.have.not.been.called()
    })

    it('does not clear when is multiple and value is empty', () => {
      const onChange = sandbox.spy()
      wrapperMount(<Dropdown clearable multiple onChange={onChange} />)

      const icon = container.querySelector('i.icon')
      fireEvent.click(icon, { stopPropagation: _.noop })
      onChange.should.have.not.been.called()
    })

    it('clears when value is not empty', () => {
      const defaultValue = options[1].value
      const onChange = sandbox.spy()

      wrapperMount(
        <Dropdown defaultValue={defaultValue} clearable onChange={onChange} options={options} />,
      )
      const clearIcon = container.querySelector('i.clear')
      fireEvent.click(clearIcon, { stopPropagation: _.noop })

      onChange.should.have.been.calledOnce()
      onChange.should.have.been.calledWithMatch({ type: 'click' }, { value: '' })
      const selectedItems = container.querySelectorAll('.selected.item')
      expect(selectedItems.length).to.equal(1)
      const firstItem = container.querySelector('.item')
      expect(firstItem.className).to.include('selected')
    })

    it('clears when value is multiple and is not empty', () => {
      const defaultValue = _.map(options, 'value')
      const onChange = sandbox.spy()

      wrapperMount(
        <Dropdown
          defaultValue={defaultValue}
          clearable
          multiple
          onChange={onChange}
          options={options}
        />,
      )
      const clearIcon = container.querySelector('i.clear')
      fireEvent.click(clearIcon, { stopPropagation: _.noop })

      onChange.should.have.been.calledOnce()
      onChange.should.have.been.calledWithMatch({ type: 'click' }, { value: [] })
      const selectedItems = container.querySelectorAll('.selected.item')
      expect(selectedItems.length).to.equal(1)
      const firstItem = container.querySelector('.item')
      expect(firstItem.className).to.include('selected')
    })
  })

  describe('handleBlur', () => {
    it('passes the event to the onBlur prop', () => {
      const onBlur = sandbox.spy()

      wrapperMount(<Dropdown onBlur={onBlur} />)
      fireEvent.blur(container.firstChild)

      onBlur.should.have.been.calledOnce()
      onBlur.should.have.been.calledWithMatch({ type: 'blur' })
    })

    // TODO: find a way to test this in a different way
    // it('calls handleChange with the selected option on blur', () => {
    //   wrapperMount(<Dropdown selectOnBlur options={options} />)
    //
    //   const instance = wrapper.instance()
    //   wrapper.simulate('click', { stopPropagation: _.noop })
    //   dropdownMenuIsOpen()
    //   sandbox.spy(instance, 'handleChange')
    //
    //   const event = { stopPropagation: _.noop }
    //   wrapper.simulate('blur', event)
    //
    //   instance.handleChange.should.have.been.calledWithMatch(event, options[0].value)
    // })

    it('does not call handleChange if the value has not changed', () => {
      const onChange = sandbox.spy()

      wrapperMount(<Dropdown onChange={onChange} options={options} selectOnBlur />)

      // focus, open and select an item
      fireEvent.click(container.firstChild)
      fireEvent.focus(container.firstChild)
      dropdownMenuIsOpen()

      const items = container.querySelectorAll('.item')
      fireEvent.click(items[2])
      dropdownMenuIsClosed()
      onChange.should.have.been.calledOnce()

      fireEvent.click(container.firstChild)
      fireEvent.click(items[2])
      dropdownMenuIsClosed()
      onChange.should.have.been.calledOnce()
    })

    it('sets searchQuery state to empty', () => {
      wrapperMount(<Dropdown defaultSearchQuery='foo' search />)

      fireEvent.blur(container.firstChild)
      const input = container.querySelector('input.search')
      expect(input.value).to.equal('')
    })

    it('does not call onBlur when the mouse is down', () => {
      const onBlur = sandbox.spy()

      wrapperMount(<Dropdown onBlur={onBlur} selectOnBlur />)

      fireEvent.mouseDown(container.firstChild)
      fireEvent.blur(container.firstChild)

      onBlur.should.not.have.been.called()
    })

    // TODO: find a way to test this in a different way
    // it('does not call makeSelectedItemActive when the mouse is down', () => {
    //   const spy = sandbox.spy()
    //
    //   wrapperMount(<Dropdown onBlur={spy} selectOnBlur />)
    //
    //   const instance = wrapper.instance()
    //   sandbox.spy(instance, 'makeSelectedItemActive')
    //
    //   wrapper.simulate('mousedown')
    //   wrapper.simulate('blur')
    //
    //   instance.makeSelectedItemActive.should.not.have.been.called()
    // })
  })

  describe('handleClose', () => {
    // TODO: find a way to test this in a different way
    // it('is called when open changes to false', () => {
    //   wrapperMount(<Dropdown options={options} selection />)
    //   wrapper.simulate('click')
    //   dropdownMenuIsOpen()
    //
    //   const instance = wrapper.instance()
    //   sandbox.spy(instance, 'handleClose')
    //
    //   wrapper.simulate('click')
    //   dropdownMenuIsClosed()
    //
    //   instance.handleClose.should.have.been.calledOnce()
    // })

    it('prevents Space from opening a search Dropdown after selecting an item', () => {
      // Prevent a bug where pressing space in another control opens the Dropdown
      // https://github.com/Semantic-Org/Semantic-UI-React/issues/692
      wrapperMount(<Dropdown options={options} search selection />)

      // open, click an item, assert it is active and in the value
      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      const firstItem = container.querySelector('.item')
      fireEvent.click(firstItem)
      expect(firstItem.className).to.include('active')
      dropdownMenuIsClosed()

      // The dropdown will be still focused after an item will be selected, we should remove
      // focus from it before
      act(() => {
        document.activeElement.blur()
      })

      // doesn't open on space
      fireEvent.keyDown(container.firstChild, { key: 'Spacebar' })
      dropdownMenuIsClosed()
    })
  })

  describe('closeOnChange', () => {
    it('will close when defined and dropdown is multiple', () => {
      wrapperMount(<Dropdown selection multiple search closeOnChange options={options} />)
      fireEvent.click(container.firstChild)

      dropdownMenuIsOpen()

      const firstItem = container.querySelector('.item')
      fireEvent.click(firstItem, nativeEvent)

      dropdownMenuIsClosed()
    })

    it('will remain open when undefined and dropdown is multiple', () => {
      wrapperMount(<Dropdown selection multiple search options={options} />)
      fireEvent.click(container.firstChild)

      dropdownMenuIsOpen()

      const firstItem = container.querySelector('.item')
      fireEvent.click(firstItem, nativeEvent)

      dropdownMenuIsOpen()
    })
  })

  describe('closeOnEscape', () => {
    it('closes the dropdown when Escape key is pressed by default', () => {
      wrapperMount(<Dropdown defaultOpen />)

      dropdownMenuIsOpen()

      domEvent.keyDown(document, { key: 'Escape' })
      dropdownMenuIsClosed()
    })

    it('closes the dropdown when is "true" and Escape key is pressed', () => {
      wrapperMount(<Dropdown defaultOpen closeOnEscape />)

      dropdownMenuIsOpen()

      domEvent.keyDown(document, { key: 'Escape' })
      dropdownMenuIsClosed()
    })

    it('does not close the dropdown when false and Escape key is pressed', () => {
      wrapperMount(<Dropdown defaultOpen closeOnEscape={false} />)

      dropdownMenuIsOpen()

      domEvent.keyDown(document, { key: 'Escape' })
      dropdownMenuIsOpen()
    })
  })

  describe('setSelectedIndex', () => {
    it('will call setSelectedIndex if options change', () => {
      wrapperMount(<Dropdown options={options} />)

      fireEvent.click(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      const selectedItems = container.querySelectorAll('.selected.item')
      expect(selectedItems.length).to.equal(1)
      const secondItem = container.querySelectorAll('.item')[1]
      expect(secondItem.className).to.include('selected')

      // Note: setProps is not supported in RTL, so we skip this part
      // wrapper.setProps({ options: [] })
      // wrapper.should.not.have.descendants('.selected.item')
    })

    it('will not call setSelectedIndex if options have not changed', () => {
      wrapperMount(<Dropdown options={options} />)

      fireEvent.click(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      const secondItem = container.querySelectorAll('.item')[1]
      expect(secondItem.className).to.include('selected')

      // Note: setProps is not supported in RTL, so we skip this part
      // wrapper.setProps({ options })
      // wrapper.find('.item').at(1).should.have.className('selected')
    })
  })

  describe('selectedIndex', () => {
    it('sets "selectedIndex" when an item was selected', () => {
      const option = _.last(options)

      wrapperMount(<Dropdown options={options} search selection />)
      const input = container.querySelector('input.search')

      // open, simulate search and select option
      fireEvent.click(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      const secondItem = container.querySelectorAll('.item')[1]
      expect(secondItem.className).to.include('selected')

      fireEvent.change(input, { target: { value: option.text } })
      fireEvent.keyDown(container.firstChild, { key: 'Enter' })
      const fifthItem = container.querySelectorAll('.item')[4]
      expect(fifthItem.className).to.include('selected')

      // open again
      fireEvent.click(container.firstChild)
      expect(fifthItem.className).to.include('selected')
    })

    it('keeps "selectedIndex" when the same item was selected', () => {
      const option = _.last(options)

      wrapperMount(<Dropdown options={options} search selection />)
      const input = container.querySelector('input.search')

      // simulate search and select option
      fireEvent.change(input, { target: { value: option.text } })
      fireEvent.keyDown(container.firstChild, { key: 'Enter' })
      const fifthItem = container.querySelectorAll('.item')[4]
      expect(fifthItem.className).to.include('selected')

      // select the same option again
      fireEvent.change(input, { target: { value: option.text } })
      fireEvent.keyDown(container.firstChild, { key: 'Enter' })
      expect(fifthItem.className).to.include('selected')
    })
  })

  describe('isMouseDown', () => {
    it('tracks when the mouse is down', () => {
      // To understand this test please check componentDidUpdate() on Dropdown component
      wrapperMount(<Dropdown />)
      dropdownMenuIsClosed()

      // When ".isMouseDown === false" a focus event will not open Dropdown
      fireEvent.mouseDown(container.firstChild)
      fireEvent.focus(container.firstChild)
      dropdownMenuIsClosed()

      // Reset to default component state
      domEvent.mouseUp(document.body)
      fireEvent.blur(container.firstChild)

      // When ".isMouseDown === true" a focus event will open Dropdown
      fireEvent.focus(container.firstChild)
      dropdownMenuIsOpen()
    })
  })

  describe('icon', () => {
    it('defaults to a dropdown icon', () => {
      wrapperMount(<Dropdown />)
      const icon = container.querySelector('.dropdown.icon')
      expect(icon).to.not.be.null()
    })

    it('always opens a dropdown on click', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      const icon = container.querySelector('i.icon')
      fireEvent.click(icon)

      dropdownMenuIsOpen()
    })

    it('always opens a dropdown on click', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      const icon = container.querySelector('i.icon')
      fireEvent.click(icon)

      dropdownMenuIsOpen()
    })

    it('passes onClick handler', () => {
      const onClick = sandbox.spy()
      const props = { name: 'user', onClick }

      wrapperMount(<Dropdown icon={props} options={options} />)
      const icon = container.querySelector('i.icon')
      fireEvent.click(icon)

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({ type: 'click' }, props)
    })
  })

  describe('searchQuery', () => {
    it('defaults to empty string', () => {
      wrapperMount(<Dropdown search />)
      const input = container.querySelector('input.search')
      expect(input.value).to.equal('')
    })

    it('passes value to state', () => {
      wrapperMount(<Dropdown search searchQuery='foo' />)
      const input = container.querySelector('input.search')
      expect(input.value).to.equal('foo')
    })
  })

  describe('selected item', () => {
    it('defaults to the first item', () => {
      wrapperMount(<Dropdown options={options} selection />)
      const firstItem = container.querySelector('.item')
      expect(firstItem.className).to.include('selected')
    })
    it('defaults to the first non-disabled item', () => {
      options[0].disabled = true
      wrapperMount(<Dropdown options={options} selection />)

      // selection moved to second item
      const firstItem = container.querySelector('.item')
      expect(firstItem.className).to.not.include('selected')

      const secondItem = container.querySelectorAll('.item')[1]
      expect(secondItem.className).to.include('selected')
    })
    it('defaults to selected item when options are initially empty', () => {
      const randomIndex = 1 + _.random(options.length - 2)
      const value = options[randomIndex].value

      const { rerender } = render(<Dropdown options={[]} selection value={value} />)
      rerender(<Dropdown options={options} selection value={value} />)

      const item = document.querySelectorAll('.item')[randomIndex]
      expect(item.className).to.include('selected')
    })
    it('is null when all options disabled', () => {
      const disabledOptions = options.map((o) => ({ ...o, disabled: true }))

      wrapperMount(<Dropdown options={disabledOptions} selection />)
      const selectedItems = container.querySelectorAll('.selected')
      expect(selectedItems.length).to.equal(0)
    })
    it('is set when clicking an item', () => {
      // random item, skip the first as it's selected by default
      const randomIndex = 1 + _.random(options.length - 2)
      wrapperMount(<Dropdown options={options} selection />)

      const item = container.querySelectorAll('.item')[randomIndex]
      fireEvent.click(item)
      expect(item.className).to.include('selected')
    })
    it('is ignored when clicking a disabled item', () => {
      // random item, skip the first as it's selected by default
      const randomIndex = 1 + _.random(options.length - 2)

      options[randomIndex].disabled = true

      wrapperMount(<Dropdown options={options} selection />)
      fireEvent.click(container.firstChild, nativeEvent)
      const item = container.querySelectorAll('.item')[randomIndex]
      fireEvent.click(item, nativeEvent)
      expect(item.className).to.not.include('selected')

      dropdownMenuIsOpen()
    })
    it('moves down on arrow down when open', () => {
      wrapperMount(<Dropdown options={options} selection />)

      // open
      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      // arrow down
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })

      // selection moved to second item
      const firstItem = container.querySelector('.item')
      expect(firstItem.className).to.not.include('selected')
      const secondItem = container.querySelectorAll('.item')[1]
      expect(secondItem.className).to.include('selected')
    })
    it('moves up on arrow up when open', () => {
      wrapperMount(<Dropdown options={options} selection />)

      // open
      fireEvent.click(container.firstChild)
      const firstItem = container.querySelector('.item')
      expect(firstItem.className).to.include('selected')

      // arrow down
      fireEvent.keyDown(container.firstChild, { key: 'ArrowUp' })

      // selection moved to last item
      expect(firstItem.className).to.not.include('selected')
      const lastItem = container.querySelectorAll('.item')[options.length - 1]
      expect(lastItem.className).to.include('selected')
    })
    it('skips over items filtered by search', () => {
      const opts = [
        { text: 'a1', value: 'a1' },
        { text: 'skip this one', value: 'skip this one' },
        { text: 'a2', value: 'a2' },
      ]
      // search for 'a'
      wrapperMount(<Dropdown options={opts} search selection />)
      fireEvent.click(container.firstChild)
      const input = container.querySelector('input.search')
      fireEvent.change(input, { target: { value: 'a' } })

      const selected = container.querySelector('.selected')
      expect(selected.textContent).to.include('a1')

      // move selection down
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })

      expect(container.querySelector('.selected').textContent).to.include('a2')
    })
    it('filters diacritics on options when using deburr prop', () => {
      const inputText = 'floresti'
      const textToFind = 'FLOREŞTI'

      const opts = [
        { text: textToFind, value: '1' },
        { text: `ŞANŢU ${textToFind}`, value: '2' },
        { text: `${textToFind} Alba`, value: '3' },
      ]

      // search for 'floresti'
      wrapperMount(<Dropdown options={opts} search deburr selection />)
      fireEvent.click(container.firstChild)
      const input = container.querySelector('input.search')
      fireEvent.change(input, { target: { value: inputText } })

      const selected = container.querySelector('.selected')
      expect(selected.textContent).to.include(textToFind)
    })
    it('filters diacritics on input when using deburr prop', () => {
      const inputText = 'FLORÉŞTI'
      const textToFind = 'FLORESTI'

      const opts = [
        { text: textToFind, value: '1' },
        { text: `SANTU ${textToFind}`, value: '2' },
        { text: `${textToFind} Alba`, value: '3' },
      ]

      // search for 'floresti'
      wrapperMount(<Dropdown options={opts} search deburr selection />)
      fireEvent.click(container.firstChild)
      const input = container.querySelector('input.search')
      fireEvent.change(input, { target: { value: inputText } })

      const selected = container.querySelector('.selected')
      expect(selected.textContent).to.include(textToFind)
    })
    it('should not filter diacritics when deburr is not set', () => {
      const inputText = 'FLORÉŞTI'
      const textToFind = 'FLORESTI'

      // Add this in case the default 'no results text' changes.
      const noResultsText = 'NoResultsFound'

      const opts = [
        { text: textToFind, value: '1' },
        { text: `SANTU ${textToFind}`, value: '2' },
        { text: `${textToFind} Alba`, value: '3' },
      ]

      // search for 'floresti'
      wrapperMount(<Dropdown options={opts} search selection noResultsMessage={noResultsText} />)
      fireEvent.click(container.firstChild)
      const input = container.querySelector('input.search')
      fireEvent.change(input, { target: { value: inputText } })

      const message = container.querySelector('.message')
      expect(message.textContent).to.include(noResultsText)
    })
    it('still works after encountering "no results"', () => {
      const opts = [
        { text: 'a1', value: 'a1' },
        { text: 'a2', value: 'a2' },
        { text: 'a3', value: 'a3' },
      ]
      wrapperMount(<Dropdown options={opts} search selection />)

      // search for 'a4'
      // no results appears
      fireEvent.click(container.firstChild)
      const input = container.querySelector('input.search')
      fireEvent.change(input, { target: { value: 'a4' } })

      const messages = container.querySelectorAll('.message')
      expect(messages.length).to.equal(1)

      // search for 'a' (simulated backspace)
      // no results is removed
      // first item is selected
      // down arrow moves selection
      fireEvent.change(input, { target: { value: 'a' } })

      const messagesAfter = container.querySelectorAll('.message')
      expect(messagesAfter.length).to.equal(0)

      const selectedItems = container.querySelectorAll('.selected')
      expect(selectedItems.length).to.equal(1)
      expect(selectedItems[0].textContent).to.include('a1')

      // move selection down
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })

      expect(container.querySelector('.selected').textContent).to.include('a2')
    })
    it('skips over disabled items', () => {
      const opts = [
        { text: 'a1', value: 'a1' },
        { text: 'skip this one', value: 'skip this one', disabled: true },
        { text: 'a2', value: 'a2' },
      ]

      wrapperMount(<Dropdown options={opts} search selection />)
      fireEvent.click(container.firstChild)

      const selected = container.querySelector('.selected')
      expect(selected.textContent).to.include('a1')

      // move selection down
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      expect(container.querySelector('.selected').textContent).to.include('a2')
    })
    it('does not enter an infinite loop when all items are disabled', () => {
      const onChange = sandbox.spy()
      const opts = [
        { text: '1', value: '1', disabled: true },
        { text: '2', value: '2', disabled: true },
      ]
      wrapperMount(<Dropdown onChange={onChange} options={opts} search selection />)

      fireEvent.click(container.firstChild)
      // move selection down
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })

      onChange.should.have.not.been.called()
    })
    it('scrolls the selected item into view', () => {
      // get enough options to make the menu scrollable
      const opts = getOptions(20)

      wrapperMount(<Dropdown options={opts} selection />)
      fireEvent.click(container.firstChild)

      dropdownMenuIsOpen()
      const menu = document.querySelector('.ui.dropdown .menu.visible')

      // Limit the menu's height and set an overflow so it's scrollable
      menu.style.height = '100px'
      menu.style.overflow = 'auto'

      //
      // Scrolls to bottom
      //

      // make sure first item is selected
      const selected = container.querySelector('.selected')
      expect(selected.textContent).to.include(opts[0].text)

      // wrap selection to last item
      fireEvent.keyDown(container.firstChild, { key: 'ArrowUp' })

      // make sure last item is selected
      expect(container.querySelector('.selected').textContent).to.include(_.last(opts).text)

      // menu should be completely scrolled to the bottom
      const isMenuScrolledToBottom = menu.scrollTop + menu.clientHeight === menu.scrollHeight
      isMenuScrolledToBottom.should.be.true(
        'When the last item in the list was selected, DropdownMenu did not scroll to bottom.',
      )

      //
      // Scrolls back to top
      //

      // wrap selection to last item
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })

      // make sure first item is selected
      expect(container.querySelector('.selected').textContent).to.include(opts[0].text)

      // Note: For some reason the first item's offsetTop is not 0 so we need
      // to find the item's offsetTop and ensure it's at the top.
      const selectedItem = document.querySelector('.ui.dropdown .menu.visible .item.selected')
      const isMenuScrolledToTop = menu.scrollTop === selectedItem.offsetTop
      isMenuScrolledToTop.should.be.true(
        'When the first item in the list was selected, DropdownMenu did not scroll to top.',
      )
    })
    it('becomes active on enter when open', () => {
      wrapperMount(<Dropdown options={options} selection />)
      fireEvent.click(container.firstChild)

      // initial item props
      const secondItem = container.querySelectorAll('.item')[1]
      expect(secondItem.className).to.not.include('selected')
      expect(secondItem.className).to.not.include('active')

      // select and make active
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      fireEvent.keyDown(container.firstChild, { key: 'Enter' })

      expect(secondItem.className).to.include('selected')
      expect(secondItem.className).to.include('active')
    })
    it('becomes active on spacebar when open', () => {
      wrapperMount(<Dropdown options={options} selection />)
      fireEvent.click(container.firstChild)

      // initial item props
      const secondItem = container.querySelectorAll('.item')[1]
      expect(secondItem.className).to.not.include('selected')
      expect(secondItem.className).to.not.include('active')

      // select and make active
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      fireEvent.keyDown(container.firstChild, { key: 'Spacebar' })

      expect(secondItem.className).to.include('selected')
      expect(secondItem.className).to.include('active')
    })
    it('closes the menu on ENTER key', () => {
      wrapperMount(<Dropdown options={options} selection />)
      fireEvent.click(container.firstChild)

      dropdownMenuIsOpen()

      // choose an item closes
      fireEvent.keyDown(container.firstChild, { key: 'Enter' })
      dropdownMenuIsClosed()
    })
    it('closes the menu on SPACE key', () => {
      wrapperMount(<Dropdown options={options} selection />)
      fireEvent.click(container.firstChild)

      dropdownMenuIsOpen()

      // choose an item closes
      fireEvent.keyDown(container.firstChild, { key: 'Spacebar' })
      dropdownMenuIsClosed()
    })
    it('closes the Search menu on ENTER key', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      fireEvent.click(container.firstChild)

      dropdownMenuIsOpen()

      // choose an item closes
      fireEvent.keyDown(container.firstChild, { key: 'Enter' })
      dropdownMenuIsClosed()
    })
    it('does not close the Search menu on SPACE key', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      fireEvent.click(container.firstChild)

      dropdownMenuIsOpen()

      // choose an item closes
      fireEvent.keyDown(container.firstChild, { key: 'Spacebar' })
      dropdownMenuIsOpen()
    })
    it('keeps value of the searchQuery when selection is changed', () => {
      wrapperMount(<Dropdown options={options} selection search />)

      const input = container.querySelector('input.search')
      fireEvent.change(input, { target: { value: 'foo' } })
      fireEvent.click(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })

      expect(input.value).to.equal('foo')
    })
  })

  describe('value', () => {
    it('sets the corresponding item to active', () => {
      const value = _.sample(options).value

      wrapperMount(<Dropdown options={options} selection value={value} />)
      const textElement = container.querySelector('.text')
      const selectedOption = options.find((option) => option.value === value)
      expect(textElement.textContent).to.include(selectedOption.text)
    })

    it('sets the corresponding item text', () => {
      const { text, value } = _.sample(options)

      wrapperMount(<Dropdown value={value} options={options} selection />)
      const textElement = container.querySelector('.text')
      expect(textElement).to.not.be.null()
      expect(textElement.textContent).to.include(text)
    })

    it('updates active item when changed', () => {
      const value = _.sample(options).value
      let next
      while (!next || next === value) next = _.sample(options).value

      const selectedOption = options.find((option) => option.value === value)
      const nextOption = options.find((option) => option.value === next)
      const { container: localContainer, rerender } = render(
        <Dropdown value={value} options={options} selection />,
      )
      expect(localContainer.querySelector('.text').textContent).to.include(selectedOption.text)

      rerender(<Dropdown value={next} options={options} selection />)
      expect(localContainer.querySelector('.text').textContent).to.include(nextOption.text)
    })

    it('updates text when value changed', () => {
      const initialItem = _.sample(options)
      const nextItem = _.sample(_.without(options, initialItem))

      const { container: localContainer, rerender } = render(
        <Dropdown options={options} selection value={initialItem.value} />,
      )
      const textElement = localContainer.querySelector('.text')
      expect(textElement.textContent).to.include(initialItem.text)

      rerender(<Dropdown options={options} selection value={nextItem.value} />)
      expect(localContainer.querySelector('.text').textContent).to.include(nextItem.text)
    })

    it('updates value on down arrow', () => {
      wrapperMount(<Dropdown options={options} selection />)

      fireEvent.click(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      const secondItem = container.querySelectorAll('.item')[1]
      expect(secondItem.className).to.include('active')
    })

    it('updates value on up arrow', () => {
      wrapperMount(<Dropdown options={options} selection />)

      fireEvent.click(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowUp' })
      const fifthItem = container.querySelectorAll('.item')[4]
      expect(fifthItem.className).to.include('active')
    })
  })

  describe('text', () => {
    it('defaults to "placeholder"', () => {
      const placeholder = faker.hacker.phrase()

      wrapperMount(<Dropdown options={options} placeholder={placeholder} />)
      const textElement = container.querySelector('.text')
      expect(textElement.textContent).to.include(placeholder)
    })
    it('sets the display text', () => {
      const text = faker.hacker.phrase()

      wrapperMount(<Dropdown options={options} selection text={text} />)
      const textElement = container.querySelector('.text')
      expect(textElement.textContent).to.include(text)
    })
    it('prevents updates on item click if defined', () => {
      const text = faker.hacker.phrase()

      wrapperMount(<Dropdown options={options} selection text={text} />)
      fireEvent.click(container.firstChild)
      const randomIndex = _.random(options.length - 1)
      const item = container.querySelectorAll('.item')[randomIndex]
      fireEvent.click(item)

      const textElement = container.querySelector('.text')
      expect(textElement.textContent).to.include(text)
    })
    it('is updated on item click if not already defined', () => {
      wrapperMount(<Dropdown options={options} selection />)

      // open
      fireEvent.click(container.firstChild)

      // click item
      const randomIndex = _.random(options.length - 1)
      const item = container.querySelectorAll('.item')[randomIndex]
      fireEvent.click(item)

      // text updated
      const textElement = container.querySelector('.text')
      expect(textElement.textContent).to.include(item.textContent)
    })
    it('is updated on item enter if multiple search results present', () => {
      const searchOptions = [
        { value: 0, text: 'foo' },
        { value: 1, text: 'foe' },
      ]
      wrapperMount(<Dropdown options={searchOptions} search selection />)

      // open and simulate search
      fireEvent.click(container.firstChild)
      const input = container.querySelector('input.search')
      fireEvent.change(input, { target: { value: 'fo' } })

      // arrow down
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      fireEvent.keyDown(container.firstChild, { key: 'Enter' })

      // text updated
      const textElement = container.querySelector('.text')
      expect(textElement.textContent).to.include('foe')
    })
    it('displays if value is 0', () => {
      const text = faker.hacker.noun()

      wrapperMount(<Dropdown options={[{ value: 0, text }]} selection />)

      // open
      fireEvent.click(container.firstChild)

      // click item
      const item = container.querySelector('.item')
      fireEvent.click(item)

      // text updated
      const textElement = container.querySelector('.text')
      expect(textElement.textContent).to.include(item.textContent)
    })
    it("does not display if value is ''", () => {
      const text = faker.hacker.noun()

      wrapperMount(<Dropdown options={[{ value: '', text }]} selection />)
      fireEvent.click(container.firstChild)
      const item = container.querySelector('.item')
      fireEvent.click(item)

      const textElement = container.querySelector('.text')
      expect(textElement.textContent).to.include(text)
    })
    it('does not display if value is null', () => {
      const text = faker.hacker.noun()

      wrapperMount(<Dropdown options={[{ value: null, text }]} selection />)
      fireEvent.click(container.firstChild)
      const item = container.querySelector('.item')
      fireEvent.click(item)

      const textElement = container.querySelector('.text')
      expect(textElement.textContent).to.include(text)
    })
    it('does not display if value is undefined', () => {
      const text = faker.hacker.noun()

      wrapperMount(<Dropdown options={[{ key: text, value: undefined, text }]} selection />)
      fireEvent.click(container.firstChild)
      const item = container.querySelector('.item')
      fireEvent.click(item)

      const textElement = container.querySelector('.text')
      expect(textElement.textContent).to.include(text)
    })
  })

  describe('trigger', () => {
    it('displays the trigger', () => {
      const text = 'Hey there'
      const trigger = <div className='trigger'>{text}</div>

      wrapperMount(<Dropdown options={options} trigger={trigger} />)
      const triggerElement = container.querySelector('.trigger')
      expect(triggerElement.textContent).to.include(text)
    })
  })

  describe('menu', () => {
    it('opens on dropdown click', () => {
      wrapperMount(<Dropdown options={options} selection />)

      dropdownMenuIsClosed()
      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()
    })

    it('opens on arrow down when focused', () => {
      wrapperMount(<Dropdown options={options} selection />)

      // Note: This mousedown is necessary to get the Dropdown focused
      // without it being open.
      fireEvent.mouseDown(container.firstChild)
      fireEvent.focus(container.firstChild)
      dropdownMenuIsClosed()

      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      dropdownMenuIsOpen()
    })

    it('opens on space when focused', () => {
      const preventDefault = sandbox.spy()
      wrapperMount(<Dropdown options={options} selection />)

      // Note: This mousedown is necessary to get the Dropdown focused
      // without it being open.
      fireEvent.mouseDown(container.firstChild)
      fireEvent.focus(container.firstChild)
      dropdownMenuIsClosed()

      fireEvent.keyDown(container.firstChild, { key: ' ', preventDefault })
      dropdownMenuIsOpen()
    })

    it('opens on space in search input when focused', () => {
      const preventDefault = sandbox.spy()
      wrapperMount(<Dropdown options={options} selection search />)

      // Note: This mousedown is necessary to get the Dropdown focused
      // without it being open.
      fireEvent.mouseDown(container.firstChild)
      fireEvent.focus(container.firstChild)
      dropdownMenuIsClosed()

      const input = container.querySelector('input.search')
      fireEvent.keyDown(input, { key: ' ', preventDefault })
      dropdownMenuIsOpen()
      preventDefault.should.have.not.been.called()
    })

    it('does not open on arrow down when not focused', () => {
      wrapperMount(<Dropdown options={options} selection />)
      dropdownMenuIsClosed()

      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      dropdownMenuIsClosed()
    })

    it('does not open on space when not focused', () => {
      wrapperMount(<Dropdown options={options} selection />)
      dropdownMenuIsClosed()

      fireEvent.keyDown(container.firstChild, { key: 'Spacebar' })
      dropdownMenuIsClosed()
    })

    it('closes on dropdown click', () => {
      wrapperMount(<Dropdown options={options} selection defaultOpen />)

      dropdownMenuIsOpen()
      fireEvent.click(container.firstChild)
      dropdownMenuIsClosed()
    })

    it('closes on menu item click', () => {
      wrapperMount(<Dropdown options={options} selection />)
      const randomIndex = _.random(options.length - 1)
      const item = container.querySelectorAll('.item')[randomIndex]

      // open
      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      // select item
      fireEvent.mouseDown(item)
      fireEvent.click(item)
      dropdownMenuIsClosed()
    })

    it('blurs after menu item click (mousedown)', () => {
      wrapperMount(<Dropdown options={options} selection />)
      const randomIndex = _.random(options.length - 1)
      const item = container.querySelectorAll('.item')[randomIndex]

      // open
      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      // select item
      fireEvent.mouseDown(item)
      dropdownMenuIsOpen()
      fireEvent.click(item)
      dropdownMenuIsClosed()
    })

    it('closes on click outside', () => {
      wrapperMount(<Dropdown options={options} selection />)

      // open
      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      // click outside
      domEvent.click(document.body)
      dropdownMenuIsClosed()
    })

    it('handles focus correctly', () => {
      wrapperMount(<Dropdown options={options} selection />)
      bodyIsFocused()

      // focus
      act(() => {
        container.firstChild.focus()
      })
      dropdownIsFocused()

      // click outside
      act(() => {
        domEvent.click(document.body)
      })
      bodyIsFocused()
    })

    it('closes on esc key', () => {
      wrapperMount(<Dropdown options={options} selection />)

      // open
      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      // esc
      domEvent.keyDown(document, { key: 'Escape' })
      dropdownMenuIsClosed()
    })
  })

  describe('onOpen', () => {
    it('called when dropdown would open', () => {
      const onOpen = sandbox.spy()
      wrapperMount(<Dropdown options={options} selection onOpen={onOpen} />)

      fireEvent.click(container.firstChild)
      onOpen.should.have.been.calledOnce()
    })

    it('not called when dropdown would not open', () => {
      const onOpen = sandbox.spy()
      wrapperMount(<Dropdown options={options} selection onOpen={onOpen} />)

      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      onOpen.should.not.have.been.calledOnce()
    })

    it('is called once when the icon is clicked with a search prop', () => {
      // https://github.com/Semantic-Org/Semantic-UI-React/issues/2600
      const onOpen = sandbox.spy()
      wrapperMount(<Dropdown options={options} selection search onOpen={onOpen} />)

      const icon = container.querySelector('i.icon')
      fireEvent.click(icon)
      onOpen.should.have.been.calledOnce()
    })
  })

  describe('onClose', () => {
    it('called when dropdown would close', () => {
      const onClose = sandbox.spy()
      wrapperMount(<Dropdown defaultOpen onClose={onClose} options={options} selection />)

      fireEvent.click(container.firstChild)
      onClose.should.have.been.calledOnce()
    })

    it('called once even when blurred', () => {
      // Heads up!
      // Special test for: https://github.com/Semantic-Org/Semantic-UI-React/issues/2953
      const onClose = sandbox.spy()
      wrapperMount(<Dropdown defaultOpen onClose={onClose} options={options} selection />)

      fireEvent.click(container.firstChild)
      fireEvent.blur(container.firstChild)
      onClose.should.have.been.calledOnce()
    })
  })

  describe('open', () => {
    it('defaultOpen opens the menu when true', () => {
      wrapperMount(<Dropdown options={options} selection defaultOpen />)
      dropdownMenuIsOpen()
    })
    it('defaultOpen opens the menu on search dropdowns', () => {
      wrapperMount(<Dropdown search options={options} selection defaultOpen />)
      dropdownMenuIsOpen()
    })
    it('defaultOpen closes the menu when false', () => {
      wrapperMount(<Dropdown options={options} selection defaultOpen={false} />)
      dropdownMenuIsClosed()
    })
    it('opens the menu when true', () => {
      wrapperMount(<Dropdown options={options} selection open />)
      dropdownMenuIsOpen()
    })
    it('closes the menu when false', () => {
      wrapperMount(<Dropdown options={options} selection open={false} />)
      dropdownMenuIsClosed()
    })
    it('closes the menu when toggled from true to false', () => {
      const { container: localContainer, rerender } = render(
        <Dropdown options={options} selection open />,
      )
      container = localContainer
      rerender(<Dropdown options={options} selection open={false} />)
      dropdownMenuIsClosed()
    })
    it('opens the menu when toggled from false to true', () => {
      const { container: localContainer, rerender } = render(
        <Dropdown options={options} selection open={false} />,
      )
      rerender(<Dropdown options={options} selection open />)
      container = localContainer
      dropdownMenuIsOpen()
    })

    // TODO: find a way to test this in a different way
    // it('calls scrollSelectedItemIntoView when changed from false to true', () => {
    //   wrapperMount(<Dropdown options={options} selection open={false} />)
    //
    //   const instance = wrapper.instance()
    //   sandbox.spy(instance, 'scrollSelectedItemIntoView')
    //
    //   instance.scrollSelectedItemIntoView.should.not.have.been.called()
    //
    //   wrapper.setProps({ open: true })
    //
    //   instance.scrollSelectedItemIntoView.should.have.been.calledOnce()
    // })
  })

  describe('multiple', () => {
    it('does not close the menu on item selection with enter', () => {
      wrapperMount(<Dropdown options={options} selection multiple />)
      fireEvent.click(container.firstChild)

      dropdownMenuIsOpen()

      // choose an item keeps menu open
      fireEvent.keyDown(container.firstChild, { key: 'Enter' })
      dropdownMenuIsOpen()
    })
    it('does not close the menu on clicking on an item', () => {
      wrapperMount(<Dropdown options={options} selection multiple />)
      fireEvent.click(container.firstChild, nativeEvent)
      const randomIndex = _.random(options.length - 1)
      const item = container.querySelectorAll('.item')[randomIndex]
      fireEvent.click(item, nativeEvent)

      dropdownMenuIsOpen()
    })
    it('filters active options out of the list', () => {
      // make all the items active, expect to see none in the list
      const value = _.map(options, 'value')

      wrapperMount(<Dropdown options={options} selection value={value} multiple />)
      const items = container.querySelectorAll('.item')
      expect(items.length).to.equal(0)
    })
    it('displays a label for active items', () => {
      // select a random item, expect a label with the item's text
      const testOptions = [
        { value: 'foo', text: 'foo' },
        { value: 'bar', text: 'bar', image: 'bar.jpg' },
        { value: 'baz', text: <span className='baz'>baz</span> },
        {
          value: 'qux',
          text: () => (
            <span className='qux' key='qux'>
              qux
            </span>
          ),
        },
      ]

      consoleUtil.disableOnce()
      wrapperMount(
        <Dropdown
          multiple
          options={testOptions}
          selection
          value={testOptions.map((option) => option.value)}
        />,
      )

      const labels = container.querySelectorAll('.label')
      expect(labels[0].textContent).to.include('foo')

      expect(labels[1].textContent).to.include('bar')
      const image = labels[1].querySelector('img')
      expect(image.getAttribute('src')).to.equal('bar.jpg')

      const spanBaz = container.querySelector('span.baz')
      expect(spanBaz.textContent).to.include('baz')
      const spanQux = container.querySelector('span.qux')
      expect(spanQux.textContent).to.include('qux')
    })
    it('keeps the selection within the range of remaining options', () => {
      // items are removed as they are made active
      // the selection should move if the last item is made active
      wrapperMount(<Dropdown options={options} selection multiple />)

      // open
      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      // activate the last item, removing it from the list
      fireEvent.keyDown(container.firstChild, { key: 'ArrowUp' })

      const items = container.querySelectorAll('.item')
      expect(items.length).to.equal(options.length)
      const lastItem = items[items.length - 1]
      expect(lastItem.className).to.include('selected')

      fireEvent.keyDown(container.firstChild, { key: 'Enter' })

      // one item should be gone, and the _new_ last item should be selected
      const itemsAfter = container.querySelectorAll('.item')
      expect(itemsAfter.length).to.equal(options.length - 1)
      const lastItemAfter = itemsAfter[itemsAfter.length - 1]
      expect(lastItemAfter.className).to.include('selected')
    })
    it('keeps the selection on the same index', () => {
      wrapperMount(<Dropdown options={options} selection multiple />)

      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      const secondItem = container.querySelectorAll('.item')[1]
      expect(secondItem.className).to.include('selected')

      fireEvent.keyDown(container.firstChild, { key: 'Enter' })
      expect(secondItem.className).to.include('selected')
    })
    it('skips disabled items in selection', () => {
      const testOptions = [
        { value: 'foo', key: 'foo', text: 'foo' },
        { value: 'bar', key: 'bar', text: 'bar' },
        { value: 'baz', key: 'baz', text: 'baz', disabled: true },
        { value: 'qux', key: 'qux', text: 'qux' },
      ]

      wrapperMount(<Dropdown options={testOptions} selection multiple />)

      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      const secondItem = container.querySelectorAll('.item')[1]
      expect(secondItem.className).to.include('selected')

      fireEvent.keyDown(container.firstChild, { key: 'Enter' })
      const thirdItem = container.querySelectorAll('.item')[2]
      expect(thirdItem.className).to.include('selected')
    })
    it('has labels with delete icons', () => {
      // add a value so we have a label
      const value = [_.head(options).value]
      wrapperMount(<Dropdown options={options} selection value={value} multiple />)
      const labels = container.querySelectorAll('.label')
      expect(labels.length).to.be.greaterThan(0)

      const deleteIcon = labels[0].querySelector('.delete.icon')
      expect(deleteIcon).to.not.be.null()
    })
    it('enables custom rendering', () => {
      const value = [_.head(options).value]
      const renderLabel = () => ({ content: 'My custom text!', as: 'div' })

      wrapperMount(
        <Dropdown options={options} selection value={value} multiple renderLabel={renderLabel} />,
      )
      const labels = container.querySelectorAll('.label')
      expect(labels.length).to.be.greaterThan(0)

      const label = labels[0]
      expect(label.textContent).to.include('My custom text!')
      expect(label.tagName.toLowerCase()).to.equal('div')
    })

    describe('selecting items', () => {
      let spy
      beforeEach(() => {
        spy = sandbox.spy()
      })

      it('does not close the menu on clicking on a label', () => {
        const value = _.map(options, 'value')
        const randomIndex = _.random(options.length - 1)

        wrapperMount(<Dropdown options={options} selection multiple value={value} />)
        fireEvent.click(container.firstChild, nativeEvent)
        const labels = container.querySelectorAll('.label')
        fireEvent.click(labels[randomIndex], nativeEvent)

        dropdownMenuIsOpen()
      })

      it('sets label to active', () => {
        const value = _.map(options, 'value')
        const randomIndex = _.random(options.length - 1)

        wrapperMount(<Dropdown options={options} selection multiple value={value} />)
        fireEvent.click(container.firstChild, nativeEvent)
        const labels = container.querySelectorAll('.label')
        fireEvent.click(labels[randomIndex], nativeEvent)

        expect(labels[randomIndex].className).to.include('active')
      })

      it('calls onLabelClick', () => {
        const value = _.map(options, 'value')
        const randomIndex = _.random(options.length - 1)
        const randomValue = value[randomIndex]

        wrapperMount(
          <Dropdown options={options} selection multiple value={value} onLabelClick={spy} />,
        )
        fireEvent.click(container.firstChild, nativeEvent)
        const labels = container.querySelectorAll('.label')
        fireEvent.click(labels[randomIndex], nativeEvent)

        spy.should.have.been.calledWithMatch({}, { value: randomValue })
      })

      it('refocuses search on select', () => {
        const randomIndex = _.random(options.length - 1)

        wrapperMount(<Dropdown options={options} search selection multiple />)
        fireEvent.click(container.firstChild, nativeEvent)
        const items = container.querySelectorAll('.item')
        fireEvent.click(items[randomIndex], nativeEvent)

        expect(document.querySelector('input.search')).equal(document.activeElement)
      })
    })
    describe('removing items', () => {
      it('calls onChange without the clicked value', () => {
        const value = _.map(options, 'value')
        const randomIndex = _.random(options.length - 1)
        const randomValue = value[randomIndex]
        const expected = _.without(value, randomValue)
        const spy = sandbox.spy()
        wrapperMount(<Dropdown options={options} selection value={value} multiple onChange={spy} />)

        const deleteIcons = container.querySelectorAll('.delete.icon')
        fireEvent.click(deleteIcons[randomIndex])

        spy.should.have.been.calledOnce()
        spy.should.have.been.calledWithMatch({}, { value: expected })
      })
    })
  })

  describe('removing items on backspace', () => {
    let spy
    beforeEach(() => {
      spy = sandbox.spy()
    })

    it('does nothing without selected items', () => {
      wrapperMount(<Dropdown options={options} selection multiple search onChange={spy} />)

      // open
      fireEvent.click(container.firstChild)

      domEvent.keyDown(document, { key: 'Backspace' })

      spy.should.not.have.been.called()
    })
    it('removes the last item when there is no search query', () => {
      const value = _.map(options, 'value')
      const expected = _.dropRight(value)
      wrapperMount(
        <Dropdown options={options} selection value={value} multiple search onChange={spy} />,
      )

      // open
      fireEvent.click(container.firstChild)

      domEvent.keyDown(document, { key: 'Backspace' })

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch({}, { value: expected })
    })

    it('does not remove the last item when there is a search query', () => {
      // search for random item
      const searchQuery = _.sample(options).text
      const value = _.map(options, 'value')
      wrapperMount(
        <Dropdown options={options} selection value={value} multiple search onChange={spy} />,
      )

      // open and simulate search
      fireEvent.click(container.firstChild)
      const input = container.querySelector('input.search')
      fireEvent.change(input, { target: { value: searchQuery } })

      domEvent.keyDown(document, { key: 'Backspace' })

      spy.should.not.have.been.called()
    })
    it('does not remove items for multiple dropdowns without search', () => {
      const value = _.map(options, 'value')
      wrapperMount(<Dropdown options={options} selection value={value} multiple onChange={spy} />)

      // open
      fireEvent.click(container.firstChild)

      domEvent.keyDown(document, { key: 'Backspace' })

      spy.should.not.have.been.called()
    })
  })

  describe('onChange', () => {
    let spy
    beforeEach(() => {
      spy = sandbox.spy()
    })

    it('is called with event and value on item click', () => {
      const randomIndex = _.random(options.length - 1)
      const randomValue = options[randomIndex].value
      wrapperMount(<Dropdown options={options} selection onChange={spy} />)
      fireEvent.click(container.firstChild)
      const items = container.querySelectorAll('.item')
      fireEvent.click(items[randomIndex])

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch({}, { value: randomValue })
    })
    it('is not called when value is not changed on item click', () => {
      wrapperMount(<Dropdown options={options} selection onChange={spy} />)

      fireEvent.click(container.firstChild)
      const firstItem = container.querySelector('.item')
      fireEvent.click(firstItem)
      spy.should.have.been.calledOnce()
      // TODO: try reenable after Enzyme update
      // https://github.com/Semantic-Org/Semantic-UI-React/pull/3747#issuecomment-522018329
      // dropdownMenuIsClosed()

      fireEvent.click(container.firstChild)
      fireEvent.click(firstItem)
      spy.should.have.been.calledOnce()
      // TODO: try reenable after Enzyme update
      // dropdownMenuIsClosed()
    })
    it('is called with event and value when pressing enter on a selected item', () => {
      const firstValue = options[0].value
      wrapperMount(<Dropdown options={options} selection onChange={spy} />)
      fireEvent.click(container.firstChild)

      fireEvent.keyDown(container.firstChild, { key: 'Enter' })

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch({}, { value: firstValue })
    })
    it('is called with event and value when blurring', () => {
      const firstValue = options[0].value
      wrapperMount(<Dropdown options={options} selection onChange={spy} />)
      fireEvent.focus(container.firstChild) // open, highlights first item
      fireEvent.blur(container.firstChild) // blur should activate selected item

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch({}, { value: firstValue })
    })
    it('is not called on blur when closed', () => {
      wrapperMount(<Dropdown options={options} selection open={false} onChange={spy} />)
      fireEvent.focus(container.firstChild)
      fireEvent.blur(container.firstChild)

      spy.should.not.have.been.called()
    })
    it('is not called on blur when selectOnBlur is false', () => {
      wrapperMount(<Dropdown options={options} selection onChange={spy} selectOnBlur={false} />)
      fireEvent.focus(container.firstChild)
      fireEvent.click(container.firstChild)

      fireEvent.blur(container.firstChild)

      spy.should.not.have.been.called()
    })

    it('removes the last item when there is no search query when uncontrolled', () => {
      const value = _.map(options, 'value')
      const expected = _.dropRight(value)
      wrapperMount(
        <Dropdown
          options={options}
          selection
          defaultValue={value}
          multiple
          search
          onChange={spy}
        />,
      )

      // open
      wrapper.simulate('click')
      domEvent.keyDown(document, { key: 'Backspace' })

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch({}, { value: expected })
    })

    it('does not remove the last item when there is a search query', () => {
      // search for random item
      const searchQuery = _.sample(options).text
      const value = _.map(options, 'value')
      wrapperMount(
        <Dropdown options={options} selection value={value} multiple search onChange={spy} />,
      )

      // open and simulate search
      fireEvent.click(container.firstChild)
      const input = container.querySelector('input.search')
      fireEvent.change(input, { target: { value: searchQuery } })

      domEvent.keyDown(document, { key: 'Backspace' })

      spy.should.not.have.been.called()
    })
    it('does not remove items for multiple dropdowns without search', () => {
      const value = _.map(options, 'value')
      wrapperMount(<Dropdown options={options} selection value={value} multiple onChange={spy} />)

      // open
      fireEvent.click(container.firstChild)

      domEvent.keyDown(document, { key: 'Backspace' })

      spy.should.not.have.been.called()
    })
  })

  describe('onChange', () => {
    let spy
    beforeEach(() => {
      spy = sandbox.spy()
    })

    it('is called with event and value on item click', () => {
      const randomIndex = _.random(options.length - 1)
      const randomValue = options[randomIndex].value
      wrapperMount(<Dropdown options={options} selection onChange={spy} />)
      fireEvent.click(container.firstChild)
      const items = container.querySelectorAll('.item')
      fireEvent.click(items[randomIndex])

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch({}, { value: randomValue })
    })
    it('is not called when value is not changed on item click', () => {
      wrapperMount(<Dropdown options={options} selection onChange={spy} />)

      fireEvent.click(container.firstChild)
      const firstItem = container.querySelector('.item')
      fireEvent.click(firstItem)
      spy.should.have.been.calledOnce()
      // TODO: try reenable after Enzyme update
      // https://github.com/Semantic-Org/Semantic-UI-React/pull/3747#issuecomment-522018329
      // dropdownMenuIsClosed()

      fireEvent.click(container.firstChild)
      fireEvent.click(firstItem)
      spy.should.have.been.calledOnce()
      // TODO: try reenable after Enzyme update
      // dropdownMenuIsClosed()
    })
    it('is called with event and value when pressing enter on a selected item', () => {
      const firstValue = options[0].value
      wrapperMount(<Dropdown options={options} selection onChange={spy} />)
      fireEvent.click(container.firstChild)

      fireEvent.keyDown(container.firstChild, { key: 'Enter' })

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch({}, { value: firstValue })
    })
    it('is called with event and value when blurring', () => {
      const firstValue = options[0].value
      wrapperMount(<Dropdown options={options} selection onChange={spy} />)
      fireEvent.focus(container.firstChild) // open, highlights first item
      fireEvent.blur(container.firstChild) // blur should activate selected item

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch({}, { value: firstValue })
    })
    it('is not called on blur when closed', () => {
      wrapperMount(<Dropdown options={options} selection open={false} onChange={spy} />)
      fireEvent.focus(container.firstChild)
      fireEvent.blur(container.firstChild)

      spy.should.not.have.been.called()
    })
    it('is not called on blur when selectOnBlur is false', () => {
      wrapperMount(<Dropdown options={options} selection onChange={spy} selectOnBlur={false} />)
      fireEvent.focus(container.firstChild)
      fireEvent.click(container.firstChild)

      fireEvent.blur(container.firstChild)

      spy.should.not.have.been.called()
    })
    it('is not called on blur with multiple select', () => {
      wrapperMount(<Dropdown options={options} selection onChange={spy} multiple />)
      fireEvent.focus(container.firstChild)
      fireEvent.click(container.firstChild)

      fireEvent.blur(container.firstChild)

      spy.should.not.have.been.called()
    })
    it('is not called when updating the value prop', () => {
      const value = _.sample(options).value
      const next = _.sample(_.without(options, value)).value

      wrapperMount(<Dropdown options={options} selection value={value} onChange={spy} />)
      // Note: setProps is not supported in RTL, so we skip this part
      // wrapper.setProps({ value: next })

      spy.should.not.have.been.called()
    })
  })

  describe('onClick', () => {
    it('is called with (event, props)', () => {
      const onClick = sandbox.spy()
      wrapperMount(<Dropdown onClick={onClick} options={options} />)
      fireEvent.click(container.firstChild, { stopPropagation: _.noop })

      onClick.should.have.been.calledOnce()
      onClick.should.have.been.calledWithMatch({}, { options })
    })

    it("toggles the dropdown when it's not searchable", () => {
      wrapperMount(<Dropdown options={options} />)

      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      fireEvent.click(container.firstChild)
      dropdownMenuIsClosed()
    })

    it("opens the dropdown when it's searchable, but don't close", () => {
      wrapperMount(<Dropdown options={options} search />)

      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()
    })

    it("don't open the dropdown when it's searchable and minCharacters is more that default value", () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} search />)

      fireEvent.click(container.firstChild)
      dropdownMenuIsClosed()
    })
  })

  describe('onFocus', () => {
    it('is called with (event, props)', () => {
      const onFocus = sandbox.spy()
      wrapperMount(<Dropdown onFocus={onFocus} options={options} />)
      fireEvent.focus(container.firstChild)

      onFocus.should.have.been.calledOnce()
      onFocus.should.have.been.calledWithMatch({}, { options })
    })

    it("opens the dropdown when it's not searchable", () => {
      wrapperMount(<Dropdown options={options} />)

      fireEvent.focus(container.firstChild)
      dropdownMenuIsOpen()
    })

    it("opens the dropdown when it's searchable", () => {
      wrapperMount(<Dropdown options={options} search />)

      fireEvent.focus(container.firstChild)
      dropdownMenuIsOpen()
    })

    it("don't open the dropdown when it's searchable and minCharacters is more that default value", () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} search />)

      fireEvent.focus(container.firstChild)
      dropdownMenuIsClosed()
    })
  })

  describe('onSearchChange', () => {
    it('is called with (event, value) on search input change', () => {
      const spy = sandbox.spy()
      wrapperMount(<Dropdown options={options} search selection onSearchChange={spy} />)
      const input = container.querySelector('input.search')
      fireEvent.change(input, { target: { value: 'a' }, stopPropagation: _.noop })

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch(
        { target: { value: 'a' } },
        {
          search: true,
          searchQuery: 'a',
        },
      )
    })

    it("don't open the menu on change if query's length is less than minCharacters", () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} selection search />)

      dropdownMenuIsClosed()

      // simulate search with query's length is less than minCharacters
      const input = container.querySelector('input.search')
      fireEvent.change(input, { target: { value: 'a' } })

      dropdownMenuIsClosed()
    })

    it("closes the opened menu on change if query's length is less than minCharacters", () => {
      wrapperMount(<Dropdown minCharacters={3} options={options} selection search />)
      const input = container.querySelector('input.search')

      fireEvent.change(input, { target: { value: 'abc' } })
      dropdownMenuIsOpen()

      fireEvent.change(input, { target: { value: 'a' } })
      dropdownMenuIsClosed()
    })
  })

  describe('options', () => {
    it('adds the onClick handler to all items', () => {
      wrapperMount(<Dropdown options={options} selection />)
      const items = container.querySelectorAll('.item')
      items.forEach((item) => {
        expect(item.onclick).to.not.be.null()
      })
    })

    // TODO: find a way to test this in a different way
    // it('calls handleItemClick when an item is clicked', () => {
    //   wrapperMount(<Dropdown options={options} selection />)
    //
    //   const instance = wrapper.instance()
    //   sandbox.spy(instance, 'handleItemClick')
    //
    //   // open
    //   wrapper.simulate('click')
    //   dropdownMenuIsOpen()
    //
    //   instance.handleItemClick.should.not.have.been.called()
    //
    //   // click random item
    //   wrapper
    //     .find('DropdownItem')
    //     .at(_.random(0, options.length - 1))
    //     .simulate('click')
    //
    //   instance.handleItemClick.should.have.been.calledOnce()
    // })
    it('renders new options when options change', () => {
      const customOptions = [
        { text: 'abra', value: 'abra' },
        { text: 'cadabra', value: 'cadabra' },
        { text: 'bang', value: 'bang' },
      ]
      const { container, rerender } = render(<Dropdown options={customOptions} />)

      let items = container.querySelectorAll('.item')
      expect(items.length).to.equal(3)

      rerender(<Dropdown options={[...customOptions, { text: 'bar', value: 'bar' }]} />)

      items = container.querySelectorAll('.item')
      expect(items.length).to.equal(4)

      const newItem = items[items.length - 1]
      expect(newItem.textContent).to.include('bar')
    })

    it('passes options as props', () => {
      const customOptions = [
        { text: 'abra', value: 'abra', 'data-foo': 'someValue' },
        { text: 'cadabra', value: 'cadabra', 'data-foo': 'someValue' },
        { text: 'bang', value: 'bang', 'data-foo': 'someValue' },
      ]
      wrapperMount(<Dropdown options={customOptions} selection />)
      const items = container.querySelectorAll('.item')
      items.forEach((item) => {
        expect(item.getAttribute('data-foo')).to.equal('someValue')
      })
    })

    it('handles keys correctly', () => {
      const customOptions = [
        { key: 0, text: 'foo', value: 'foo' },
        { key: null, text: 'bar', value: 'bar' },
        { key: undefined, text: 'baz', value: 'baz' },
      ]
      wrapperMount(<Dropdown options={customOptions} selection />)
      const items = container.querySelectorAll('.item')

      expect(items[0].textContent).to.include('foo')
      expect(items[1].textContent).to.include('bar')
      expect(items[2].textContent).to.include('baz')
    })

    it('invokes "onClick" on item and handles', () => {
      const onItemClick = sandbox.spy()
      const customOptions = [
        { key: 'foo', text: 'foo', value: 'foo' },
        { key: 'bar', text: 'bar', value: 'bar', onClick: onItemClick },
      ]

      wrapperMount(<Dropdown options={customOptions} />)
      dropdownMenuIsClosed()

      fireEvent.click(container.firstChild)
      fireEvent.focus(container.firstChild)
      dropdownMenuIsOpen()

      const items = container.querySelectorAll('.item')
      fireEvent.click(items[1])
      dropdownMenuIsClosed()
      expect(items[1].className).to.include('selected')

      onItemClick.should.have.been.calledOnce()
      onItemClick.should.have.been.calledWithMatch({ type: 'click' }, { value: 'bar' })
    })
  })

  describe('search', () => {
    it('does not add a search input when not defined', () => {
      wrapperMount(<Dropdown options={options} selection />)

      expect(container.querySelector('input.search')).to.be.null()
    })

    it('adds a search input when present', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      expect(container.querySelector('input.search')).to.not.be.null()
    })

    it('sets focus to the search input on open', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      fireEvent.click(container.firstChild)

      const activeElement = document.activeElement
      const searchIsFocused = activeElement === document.querySelector('input.search')
      searchIsFocused.should.be.true(
        `Expected "input.search" to be the active element but found ${activeElement} instead.`,
      )
    })

    it('sets focus to the search input on click on the placeholder', () => {
      wrapperMount(
        <Dropdown minCharacters={3} options={options} placeholder='foo' selection search />,
      )

      const dropdownText = container.querySelector('.dropdown .text')
      fireEvent.click(dropdownText)

      const activeElement = document.activeElement
      const searchIsFocused = activeElement === document.querySelector('input.search')
      searchIsFocused.should.be.true(
        `Expected "input.search" to be the active element but found ${activeElement} instead.`,
      )
    })

    it('sets focus to the search input on click Dropdown when is opened', () => {
      wrapperMount(<Dropdown open options={options} multiple selection search />)
      fireEvent.click(container.firstChild)

      const activeElement = document.activeElement
      const searchIsFocused = activeElement === document.querySelector('input.search')
      searchIsFocused.should.be.true(
        `Expected "input.search" to be the active element but found ${activeElement} instead.`,
      )
    })

    it('clears the search query when an item is selected', () => {
      // search for random item
      const searchQuery = _.sample(options).text

      wrapperMount(<Dropdown options={options} selection search />)

      // open and simulate search
      fireEvent.click(container.firstChild)
      const searchInput = container.querySelector('input.search')
      fireEvent.change(searchInput, { target: { value: searchQuery } })

      // click first item (we searched for exact text)
      const firstItem = container.querySelector('.item')
      fireEvent.click(firstItem)

      // bye bye search query
      expect(searchInput.value).to.equal('')
    })

    it('opens the menu on change if there is a query and not already open', () => {
      wrapperMount(<Dropdown options={options} selection search />)

      dropdownMenuIsClosed()

      // simulate search
      const searchInput = container.querySelector('input.search')
      fireEvent.change(searchInput, { target: { value: faker.hacker.noun() } })

      dropdownMenuIsOpen()
    })

    it('does not call onChange on query change', () => {
      const onChange = sandbox.spy()
      wrapperMount(<Dropdown options={options} selection search onChange={onChange} />)

      // simulate search
      const searchInput = container.querySelector('input.search')
      fireEvent.change(searchInput, { target: { value: faker.hacker.noun() } })

      onChange.should.not.have.been.called()
    })

    it('filters the items based on display text', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      const searchInput = container.querySelector('input.search')

      // search for value yields 0 results
      fireEvent.change(searchInput, { target: { value: _.sample(options).value } })

      const itemsAfterValueSearch = container.querySelectorAll('.item')
      expect(itemsAfterValueSearch.length).to.equal(0)

      // search for text yields 1 result
      fireEvent.change(searchInput, { target: { value: _.sample(options).text } })

      const itemsAfterTextSearch = container.querySelectorAll('.item')
      expect(itemsAfterTextSearch.length).to.equal(1)
    })

    it('filters the items based on custom search function', () => {
      const searchFunction = sandbox.stub().returns(options.slice(0, 2))
      wrapperMount(<Dropdown options={options} selection search={searchFunction} />)
      const searchInput = container.querySelector('input.search')
      const searchQuery = '__nonExistingSearchQuery__'

      // search for value yields 2 results as per our custom search function
      fireEvent.change(searchInput, { target: { value: searchQuery } })

      searchFunction.should.have.been.calledWithMatch(options, searchQuery)
      const items = container.querySelectorAll('.item')
      expect(items.length).to.equal(2)
    })

    it('sets the selected item to the first search result', () => {
      const testOptions = [
        { value: 'foo', key: 'foo', text: 'foo' },
        { value: 'bar', key: 'bar', text: 'bar' },
        { value: 'baz', key: 'baz', text: 'baz' },
        { value: 'qux', key: 'qux', text: 'qux' },
      ]

      wrapperMount(<Dropdown options={testOptions} selection search />)

      // the first item is selected by default
      // avoid it to prevent false positives
      fireEvent.click(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowUp' })
      const items = container.querySelectorAll('.item')
      expect(items[3].className).to.include('selected')

      const searchInput = container.querySelector('input.search')
      fireEvent.change(searchInput, { target: { value: 'baz' } })
      const filteredItems = container.querySelectorAll('.item')
      expect(filteredItems[0].className).to.include('selected')
    })

    it('still allows moving selection after blur/focus', () => {
      // open, first item is selected
      wrapperMount(<Dropdown options={options} selection search />)

      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      const items = container.querySelectorAll('.item')
      expect(items[0].className).to.include('selected')

      // blur, focus, open, move item selection down
      fireEvent.blur(container.firstChild)
      fireEvent.focus(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })

      expect(items[0].className).to.not.include('selected')
      expect(items[1].className).to.include('selected')

      // blur, focus, open, move item selection up
      fireEvent.blur(container.firstChild)
      fireEvent.focus(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowUp' })

      expect(items[0].className).to.include('selected')
      expect(items[1].className).to.not.include('selected')
    })

    it('does not close the menu when options are empty', () => {
      wrapperMount(<Dropdown options={options} search selection />)
      fireEvent.click(container.firstChild)

      const searchInput = container.querySelector('input.search')
      fireEvent.change(searchInput, { target: { value: 'foo' } })
      fireEvent.keyDown(container.firstChild, { key: 'Enter' })

      dropdownMenuIsOpen()
    })

    it('sets focus to the search input after selection', () => {
      // random item, skip the first as it's selected by default
      const randomIndex = 1 + _.random(options.length - 2)

      wrapperMount(<Dropdown options={options} selection search />)
      fireEvent.click(container.firstChild, nativeEvent)
      const items = container.querySelectorAll('.item')
      fireEvent.click(items[randomIndex], nativeEvent)

      dropdownMenuIsClosed()
      dropdownInputIsFocused()
    })

    it('sets focus to the dropdown after selection', () => {
      const randomIndex = _.random(options.length - 1)

      wrapperMount(<Dropdown options={options} selection />)
      fireEvent.click(container.firstChild, nativeEvent)
      const items = container.querySelectorAll('.item')
      fireEvent.click(items[randomIndex], nativeEvent)

      // TODO: try reenable after Enzyme update
      // https://github.com/Semantic-Org/Semantic-UI-React/pull/3747#issuecomment-522018329
      // dropdownMenuIsClosed()
      dropdownIsFocused()
    })

    it('does not selected "disabled" item after blur', () => {
      const customOptions = [
        { key: 'foo', text: 'foo', value: 'foo' },
        { key: 'bar', text: 'bar', value: 'bar', disabled: true },
      ]

      wrapperMount(<Dropdown options={customOptions} selection search />)

      fireEvent.focus(container.firstChild)
      dropdownMenuIsOpen()

      const searchInput = container.querySelector('input.search')
      fireEvent.change(searchInput, { target: { value: 'bar' } })
      act(() => {
        searchInput.blur()
        fireEvent.blur(container.firstChild)
      })

      dropdownMenuIsClosed()
      const disabledItem = container.querySelector('.item.disabled')
      expect(disabledItem.className).to.not.include('selected')
    })
  })

  describe('searchInput', () => {
    it('overrides onChange handler', () => {
      const onInputChange = sandbox.spy()
      const onSearchChange = sandbox.spy()

      wrapperMount(
        <Dropdown
          onSearchChange={onSearchChange}
          options={options}
          search
          searchInput={{ onChange: onInputChange }}
        />,
      )

      const searchInput = container.querySelector('input.search')
      fireEvent.change(searchInput, {
        stopPropagation: _.noop,
        target: { value: faker.hacker.noun() },
      })

      onInputChange.should.have.been.calledOnce()
      onSearchChange.should.have.been.calledOnce()
    })
  })

  describe('no results message', () => {
    it('is shown when a search yields no results', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      const searchInput = container.querySelector('input.search')

      expect(container.querySelector('.message')).to.be.null()

      // search for something we know will not exist
      fireEvent.change(searchInput, { target: { value: '_________________' } })

      expect(container.querySelector('.message')).to.not.be.null()
    })

    it('is not shown on multiple dropdowns with no remaining items', () => {
      // make all the items active so there are no remaining options
      const value = _.map(options, 'value')
      wrapperMount(<Dropdown options={options} selection value={value} multiple />)

      // open the menu
      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()

      // confirm there are no items
      expect(container.querySelectorAll('.item').length).to.equal(0)

      // expect no message
      expect(container.querySelector('.message')).to.be.null()
    })

    it('uses default noResultsMessage', () => {
      wrapperMount(<Dropdown options={options} selection search />)
      const searchInput = container.querySelector('input.search')

      // search for something we know will not exist
      fireEvent.change(searchInput, { target: { value: '_________________' } })

      expect(container.querySelector('.message').textContent).to.equal('No results found.')
    })

    it('uses custom string for noResultsMessage', () => {
      wrapperMount(
        <Dropdown options={options} selection search noResultsMessage='Something custom' />,
      )
      const searchInput = container.querySelector('input.search')

      // search for something we know will not exist
      fireEvent.change(searchInput, { target: { value: '_________________' } })

      expect(container.querySelector('.message').textContent).to.equal('Something custom')
    })

    it('uses custom component for noResultsMessage', () => {
      wrapperMount(
        <Dropdown
          options={options}
          selection
          search
          noResultsMessage={<span>Something custom</span>}
        />,
      )
      const searchInput = container.querySelector('input.search')

      // search for something we know will not exist
      fireEvent.change(searchInput, { target: { value: '_________________' } })

      expect(container.querySelector('.message span')).to.not.be.null()
    })

    it('uses no noResultsMessage', () => {
      wrapperMount(<Dropdown options={options} selection search noResultsMessage='' />)
      const searchInput = container.querySelector('input.search')

      // search for something we know will not exist
      fireEvent.change(searchInput, { target: { value: '_________________' } })

      expect(container.querySelector('.message').textContent).to.equal('')
    })
    it('is not shown when set to `null`', () => {
      wrapperMount(<Dropdown options={options} selection search noResultsMessage={null} />)
      const searchInput = container.querySelector('input.search')

      // search for something we know will not exist
      fireEvent.change(searchInput, { target: { value: '_________________' } })

      expect(container.querySelector('.message')).to.be.null()
    })
  })

  describe('placeholder', () => {
    it('is present when defined', () => {
      wrapperMount(<Dropdown options={options} selection placeholder='hi' />)
      expect(container.querySelector('.default.text')).to.not.be.null()
    })
    it('is not present when not defined', () => {
      wrapperMount(<Dropdown options={options} selection />)
      expect(container.querySelector('.default.text')).to.be.null()
    })
    it('is not present when there is a value', () => {
      wrapperMount(<Dropdown options={options} selection value='hi' placeholder='hi' />)
      expect(container.querySelector('.default.text')).to.be.null()
    })
    it('is present on a multiple dropdown with an empty value array', () => {
      wrapperMount(<Dropdown options={options} selection multiple placeholder='hi' />)
      expect(container.querySelector('.default.text')).to.not.be.null()
    })
    it('has a filtered className when there is a search query', () => {
      wrapperMount(<Dropdown options={options} selection search placeholder='hi' />)

      const searchInput = container.querySelector('input.search')
      fireEvent.change(searchInput, { target: { value: 'a' } })
      expect(container.querySelector('.default.text.filtered')).to.not.be.null()
    })
  })

  describe.skip('render', () => {
    // TODO: find a way to test this in a different way
    // it('calls renderText', () => {
    //   wrapperMount(<Dropdown options={options} selection />)
    //
    //   const instance = wrapper.instance()
    //   sandbox.spy(instance, 'renderText')
    //
    //   instance.renderText.should.not.have.been.called()
    //
    //   instance.render()
    //
    //   instance.renderText.should.have.been.called()
    // })
  })

  describe('lazyLoad', () => {
    it('does not render options when closed', () => {
      wrapperMount(<Dropdown options={options} lazyLoad />)
      expect(container.querySelectorAll('.item').length).to.equal(0)
    })

    it('renders options when open', () => {
      wrapperMount(<Dropdown options={options} lazyLoad open />)
      expect(container.querySelectorAll('.item').length).to.be.greaterThan(0)
    })
  })

  describe('Dropdown.Menu child', () => {
    it('renders child passed', () => {
      wrapperMount(
        <Dropdown text='required prop'>
          <Dropdown.Menu data-find-me />
        </Dropdown>,
      )

      expect(container.querySelector('.menu')).to.not.be.null()
      expect(container.querySelector('.menu').getAttribute('data-find-me')).to.equal('true')
    })

    it('opens on click', () => {
      wrapperMount(
        <Dropdown text='required prop'>
          <Dropdown.Menu />
        </Dropdown>,
      )

      dropdownMenuIsClosed()
      fireEvent.click(container.firstChild)
      dropdownMenuIsOpen()
    })

    it('spreads extra menu props', () => {
      wrapperMount(
        <Dropdown text='required prop'>
          <Dropdown.Menu data-foo-bar />
        </Dropdown>,
      )

      expect(container.querySelector('.menu')).to.not.be.null()
      expect(container.querySelector('.menu').getAttribute('data-foo-bar')).to.equal('true')
    })

    it("merges the user's menu className", () => {
      wrapperMount(
        <Dropdown text='required prop'>
          <Dropdown.Menu className='foo-bar' />
        </Dropdown>,
      )

      const menu = container.querySelector('.menu')
      expect(menu).to.not.be.null()
      expect(menu.className).to.include('menu')
      expect(menu.className).to.include('foo-bar')
    })
  })

  describe('allowAdditions', () => {
    const customOptions = [
      { text: 'abra', value: 'abra' },
      { text: 'cadabra', value: 'cadabra' },
      { text: 'bang', value: 'bang' },
    ]

    it('adds an option for arbitrary search value', () => {
      wrapperMount(<Dropdown options={customOptions} selection search allowAdditions />)

      const search = container.querySelector('input.search')

      expect(container.querySelectorAll('.item').length).to.equal(3)

      fireEvent.change(search, { target: { value: 'boo' } })

      expect(container.querySelectorAll('.item').length).to.equal(1)
      expect(container.querySelectorAll('.item')[0].textContent).to.include('boo')
    })

    it('adds an option for prefix search value', () => {
      wrapperMount(<Dropdown options={customOptions} selection search allowAdditions />)

      const search = container.querySelector('input.search')

      expect(container.querySelectorAll('.item').length).to.equal(3)

      fireEvent.change(search, { target: { value: 'a' } })

      expect(container.querySelectorAll('.item').length).to.equal(4)
      expect(container.querySelectorAll('.item')[0].textContent).to.include('a')
    })

    it('uses default additionLabel', () => {
      wrapperMount(<Dropdown options={customOptions} selection search allowAdditions />)
      const search = container.querySelector('input.search')

      fireEvent.change(search, { target: { value: 'boo' } })

      expect(container.querySelectorAll('.item').length).to.equal(1)
      expect(container.querySelectorAll('.item')[0].className).to.include('addition')

      const item = container.querySelectorAll('.item')[0]
      expect(item.textContent).to.include('Add ')
      expect(item.textContent).to.include('boo')
    })

    it('uses custom additionLabel string', () => {
      wrapperMount(
        <Dropdown options={customOptions} selection search allowAdditions additionLabel='New: ' />,
      )

      const search = container.querySelector('input.search')

      fireEvent.change(search, { target: { value: 'boo' } })

      expect(container.querySelectorAll('.item').length).to.equal(1)
      expect(container.querySelectorAll('.item')[0].className).to.include('addition')

      const item = container.querySelectorAll('.item')[0]
      expect(item.textContent).to.include('New: ')
      expect(item.textContent).to.include('boo')
    })

    it('uses custom additionLabel element', () => {
      wrapperMount(
        <Dropdown
          options={customOptions}
          selection
          search
          allowAdditions
          additionLabel={<i>New: </i>}
        />,
      )

      const search = container.querySelector('input.search')
      fireEvent.change(search, { target: { value: 'boo' } })

      expect(container.querySelectorAll('.item').length).to.equal(1)
      expect(container.querySelectorAll('.item')[0].className).to.include('addition')

      const item = container.querySelectorAll('.item')[0]
      expect(item.querySelector('i')).to.not.be.null()
      expect(item.querySelector('i').textContent).to.equal('New: ')
      expect(item.querySelector('b')).to.not.be.null()
      expect(item.querySelector('b').textContent).to.equal('boo')
    })

    it('uses no additionLabel', () => {
      wrapperMount(
        <Dropdown options={customOptions} selection search allowAdditions additionLabel='' />,
      )
      const search = container.querySelector('input.search')

      fireEvent.change(search, { target: { value: 'boo' } })

      expect(container.querySelectorAll('.item').length).to.equal(1)
      expect(container.querySelectorAll('.item')[0].className).to.include('addition')

      const item = container.querySelectorAll('.item')[0]
      expect(item.textContent).to.equal('boo')
      expect(item.querySelector('b')).to.not.be.null()
      expect(item.querySelector('b').textContent).to.equal('boo')
    })

    it('keeps custom value option (bottom) when options change', () => {
      wrapperMount(
        <Dropdown
          options={customOptions}
          selection
          search
          allowAdditions
          additionPosition='bottom'
        />,
      )
      const search = container.querySelector('input.search')

      fireEvent.change(search, { target: { value: 'a' } })

      expect(container.querySelectorAll('.item').length).to.equal(4)
      expect(container.querySelectorAll('.item')[3].textContent).to.include('a')

      // Note: setProps is not supported in RTL, using rerender instead
      const { container: localContainer, rerender } = render(
        <Dropdown
          options={customOptions}
          selection
          search
          allowAdditions
          additionPosition='bottom'
        />,
      )

      const localSearch = localContainer.querySelector('input.search')
      fireEvent.change(localSearch, { target: { value: 'a' } })

      rerender(
        <Dropdown
          options={[...customOptions, { text: 'bar', value: 'bar' }]}
          selection
          search
          allowAdditions
          additionPosition='bottom'
        />,
      )

      expect(localContainer.querySelectorAll('.item').length).to.equal(5)
      expect(localContainer.querySelectorAll('.item')[4].textContent).to.include('a')
    })

    it('keeps custom value option (top) when options change', () => {
      const { container, rerender } = render(
        <Dropdown options={customOptions} selection search allowAdditions />,
      )

      const search = container.querySelector('input.search')

      fireEvent.change(search, { target: { value: 'a' } })

      expect(container.querySelectorAll('.item').length).to.equal(4)
      expect(container.querySelectorAll('.item')[0].textContent).to.include('a')

      rerender(
        <Dropdown
          options={[...customOptions, { text: 'bar', value: 'bar' }]}
          selection
          search
          allowAdditions
        />,
      )

      expect(container.querySelectorAll('.item').length).to.equal(5)
      expect(container.querySelectorAll('.item')[0].textContent).to.include('a')
    })

    it('calls onAddItem prop when clicking new value', () => {
      const onAddItem = sandbox.spy()
      const onChange = sandbox.spy()
      wrapperMount(
        <Dropdown
          allowAdditions
          onAddItem={onAddItem}
          onChange={onChange}
          options={customOptions}
          search
          selection
        />,
      )
      const search = container.querySelector('input.search')

      fireEvent.change(search, { target: { value: 'boo' } })

      fireEvent.click(container.querySelectorAll('.item')[0])

      onChange.should.have.been.calledOnce()
      onAddItem.should.have.been.calledOnce()
      onAddItem.should.have.been.calledWithMatch({}, { value: 'boo' })
      onAddItem.should.have.been.calledImmediatelyAfter(onChange)
    })

    it('calls onAddItem prop when pressing enter on new value', () => {
      const onAddItem = sandbox.spy()
      const onChange = sandbox.spy()

      wrapperMount(
        <Dropdown
          allowAdditions
          onAddItem={onAddItem}
          onChange={onChange}
          options={customOptions}
          search
          selection
        />,
      )
      const search = container.querySelector('input.search')

      fireEvent.change(search, { target: { value: 'boo' } })
      fireEvent.keyDown(search, { key: 'Enter' })

      onChange.should.have.been.calledOnce()
      onAddItem.should.have.been.calledOnce()
      onAddItem.should.have.been.calledWithMatch({}, { value: 'boo' })
      onAddItem.should.have.been.calledImmediatelyAfter(onChange)
    })

    it('clears value of the searchQuery when selection is only option', () => {
      wrapperMount(<Dropdown options={customOptions} selection search allowAdditions />)

      const search = container.querySelector('input.search')

      fireEvent.change(search, { target: { value: 'boo' } })
      fireEvent.keyDown(search, { key: 'Enter' })

      expect(container.querySelector('input.search').value).to.equal('')
    })
  })

  describe('header', () => {
    it('renders a header when present', () => {
      const text = faker.hacker.phrase()

      wrapperMount(<Dropdown options={options} header={text} />)
      expect(container.querySelector('.menu .header').textContent).to.equal(text)
    })
    it('does not render a header when not present', () => {
      wrapperMount(<Dropdown options={options} />)
      expect(container.querySelector('.menu .header')).to.be.null()
    })
  })

  describe('value validations', () => {
    it('logs an error if dropdown is not multiple and value is array', () => {
      consoleUtil.disableOnce()
      const spy = sandbox.spy(console, 'error')

      const originalValue = _.pick(options, 'value')[0]
      const nextValue = _.castArray(_.pick(options, 'value')[1])

      const { rerender } = render(<Dropdown options={options} value={originalValue} selection />)
      rerender(<Dropdown options={options} value={nextValue} selection />)

      const errorMessage =
        'Dropdown `value` must not be an array when `multiple` is not set.' +
        ' Either set `multiple={true}` or use a string or number value.'

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch(errorMessage)
    })

    it('logs an error if dropdown is multiple and value not array', () => {
      consoleUtil.disableOnce()
      const spy = sandbox.spy(console, 'error')

      const originalValue = _.castArray(_.pick(options, 'value')[0])
      const nextValue = _.pick(options, 'value')[1]

      const { rerender } = render(
        <Dropdown options={options} value={originalValue} selection multiple />,
      )
      rerender(<Dropdown options={options} value={nextValue} selection multiple />)

      const errorMessage =
        'Dropdown `value` must be an array when `multiple` is set.' +
        ` Received type: \`${Object.prototype.toString.call(nextValue)}\`.`

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch(errorMessage)
    })
  })

  describe('selectOnNavigation', () => {
    it('is on by default', () => {
      const onChange = sandbox.spy()

      wrapperMount(
        <Dropdown options={options} defaultValue={options[0].value} onChange={onChange} />,
      )

      // open
      fireEvent.click(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })

      onChange.should.have.been.called()
      expect(container.querySelectorAll('.item')[1].className).to.include('active')
    })

    it('does not change value when set to false', () => {
      const onChange = sandbox.spy()
      const value = options[0].value

      wrapperMount(
        <Dropdown
          options={options}
          defaultValue={value}
          selectOnNavigation={false}
          onChange={onChange}
        />,
      )

      // open
      fireEvent.click(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })

      onChange.should.not.have.been.called()
      expect(container.querySelectorAll('.item')[0].className).to.include('active')
    })
  })

  describe('wrapSelection', () => {
    it("does not move up on arrow up when first item is selected when open and 'wrapSelection' is false", () => {
      wrapperMount(<Dropdown options={options} selection wrapSelection={false} />)

      // open
      fireEvent.click(container.firstChild)
      expect(container.querySelectorAll('.item')[0].className).to.include('selected')

      // arrow up
      fireEvent.keyDown(container.firstChild, { key: 'ArrowUp' })

      // selection should not move to last item
      // should keep on first instead
      expect(container.querySelectorAll('.item')[0].className).to.include('selected')
      expect(container.querySelectorAll('.item')[options.length - 1].className).to.not.include(
        'selected',
      )
      expect(container.querySelectorAll('.item')[options.length - 1].className).to.not.include(
        'selected',
      )
    })
    it("does not move down on arrow down when last item is selected when open and 'wrapSelection' is false", () => {
      wrapperMount(<Dropdown options={options} selection wrapSelection={false} />)

      // open and make last item selected
      fireEvent.click(container.firstChild)
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })

      expect(container.querySelectorAll('.item')[options.length - 1].className).to.include(
        'selected',
      )

      // selection should not move to first item, should keep on last instead
      fireEvent.keyDown(container.firstChild, { key: 'ArrowDown' })
      expect(container.querySelectorAll('.item')[0].className).to.not.include('selected')
      expect(container.querySelectorAll('.item')[options.length - 1].className).to.include(
        'selected',
      )
    })
  })

  describe('upward', () => {
    it('is false when there is enough space below', () => {
      wrapperMount(<Dropdown options={options} />)

      fireEvent.click(container.firstChild)
      expect(container.firstChild.className).to.not.include('upward')
    })

    it.skip('is true when there is not enough space below', () => {
      wrapperMount(
        <Dropdown
          options={options}
          style={{ marginTop: document.documentElement.clientHeight - 50 }}
        />,
      )

      fireEvent.click(container.firstChild)
      expect(container.firstChild.className).to.include('upward')
    })
  })
})
