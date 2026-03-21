import _ from 'lodash'
import faker from 'faker'
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'

import { htmlInputAttrs } from 'src/lib'
import Search from 'src/modules/Search'
import SearchCategory from 'src/modules/Search/SearchCategory'
import SearchResult from 'src/modules/Search/SearchResult'
import SearchResults from 'src/modules/Search/SearchResults'
import * as common from 'test/specs/commonTests'
import { consoleUtil, domEvent, sandbox } from 'test/utils'

let attachTo
let options
let wrapper

const getOptions = (count = 5) =>
  _.times(count, (i) => ({
    title: [i, ..._.times(3, faker.hacker.noun)].join(' '),
    description: [i, ..._.times(3, faker.hacker.noun)].join(' '),
    image: '/images/wireframe/image.png',
    price: [i, faker.finance.amount(0, 100, 2, '$')].join(' '),
  }))

const searchResultsIsClosed = (container) => {
  const menu = container.querySelector('.results')
  expect(container.firstChild.classList.contains('visible')).to.equal(false)
  expect(menu.classList.contains('visible')).to.equal(false)
}

const searchResultsIsOpen = (container) => {
  const menu = container.querySelector('.results')
  expect(container.firstChild.classList.contains('active')).to.equal(true)
  expect(container.firstChild.classList.contains('visible')).to.equal(true)
  expect(menu.classList.contains('visible')).to.equal(true)
}

const openSearchResults = (container) => {
  fireEvent.focus(container.firstChild)
}

const nativeEvent = { nativeEvent: { stopImmediatePropagation: _.noop } }

const wrapperMount = (node, opts) => {
  attachTo = document.createElement('div')
  document.body.appendChild(attachTo)

  const result = render(node, { ...opts, container: attachTo })
  wrapper = result
  return result
}

describe('Search', () => {
  beforeEach(() => {
    attachTo = undefined
    wrapper = undefined
    options = getOptions()
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
    if (attachTo) document.body.removeChild(attachTo)
  })

  common.isConformant(Search)
  common.forwardsRef(Search)
  common.hasSubcomponents(Search, [SearchCategory, SearchResult, SearchResults])
  common.hasUIClassName(Search)

  common.propKeyOnlyToClassName(Search, 'category')
  common.propKeyOnlyToClassName(Search, 'fluid')
  common.propKeyOnlyToClassName(Search, 'loading')

  it('closes on blur', () => {
    const { container } = wrapperMount(<Search results={options} minCharacters={0} />)

    openSearchResults(container)
    searchResultsIsOpen(container)
    fireEvent.blur(container.firstChild)
    searchResultsIsClosed(container)
  })

  it('opens on focus', () => {
    const { container } = wrapperMount(<Search results={options} minCharacters={0} />)

    searchResultsIsClosed(container)
    fireEvent.focus(container.firstChild)
    searchResultsIsOpen(container)
  })

  describe('isMouseDown', () => {
    it('tracks when the mouse is down', () => {
      const { container } = wrapperMount(<Search minCharacters={0} />)
      searchResultsIsClosed(container)

      // When ".isMouseDown === false" a focus event will not open Search results
      fireEvent.mouseDown(container.firstChild)
      fireEvent.focus(container.firstChild)
      searchResultsIsClosed(container)

      // Reset to default component state
      fireEvent.blur(container.firstChild)
      domEvent.mouseUp(document.body)

      // When ".isMouseDown === true" a focus event will open Search results
      fireEvent.focus(container.firstChild)
      searchResultsIsOpen(container)
    })
  })

  describe('icon', () => {
    it('defaults to a search icon', () => {
      const { container } = wrapperMount(<Search />)
      expect(container.querySelector('.search.icon')).toBeTruthy()
    })
  })

  describe('active item', () => {
    it('defaults to no result active', () => {
      const { container } = wrapperMount(<Search results={options} minCharacters={0} />)
      expect(container.querySelector('.result.active')).toBeFalsy()
    })
    it('defaults to the first item with selectFirstResult', () => {
      const { container } = wrapperMount(
        <Search results={options} minCharacters={0} selectFirstResult />,
      )
      const results = container.querySelectorAll('.result')
      expect(results[0].classList.contains('active')).to.equal(true)
    })
    it('moves down on arrow down when open', () => {
      const { container } = wrapperMount(
        <Search results={options} minCharacters={0} selectFirstResult />,
      )

      // open
      openSearchResults(container)
      searchResultsIsOpen(container)

      // arrow to second
      domEvent.keyDown(document, { key: 'ArrowDown' })

      // selection moved to second item
      const results = container.querySelectorAll('.result')
      expect(results[0].classList.contains('active')).to.equal(false)
      expect(results[1].classList.contains('active')).to.equal(true)
    })
    it('moves up on arrow up when open', () => {
      const { container } = wrapperMount(<Search results={options} minCharacters={0} />)

      // open
      openSearchResults(container)
      searchResultsIsOpen(container)

      // arrow up
      domEvent.keyDown(document, { key: 'ArrowUp' })

      // selection moved to last item
      const results = container.querySelectorAll('.result')
      expect(results[0].classList.contains('active')).to.equal(false)
      expect(results[options.length - 1].classList.contains('active')).to.equal(true)
    })
    it('scrolls the selected item into view', async () => {
      // get enough options to make the menu scrollable
      const opts = getOptions(20)

      const { container } = wrapperMount(
        <Search results={opts} minCharacters={0} selectFirstResult />,
      )

      openSearchResults(container)
      searchResultsIsOpen(container)
      const menu = document.querySelector('.ui.search .results.visible')

      // Limit the menu's height and set an overflow so it's scrollable
      menu.style.height = '100px'
      menu.style.overflow = 'auto'

      // make sure first item is selected
      const activeResult = container.querySelector('.result.active')
      expect(activeResult.textContent).to.contain(opts[0].title)

      // wrap selection to last item
      domEvent.keyDown(document, { key: 'ArrowUp' })

      // make sure last item is selected
      const newActive = container.querySelector('.result.active')
      expect(newActive.textContent).to.contain(_.tail(opts).title)

      // menu should be completely scrolled to the bottom
      const isMenuScrolledToBottom = menu.scrollTop + menu.clientHeight === menu.scrollHeight
      expect(isMenuScrolledToBottom).to.equal(true)

      // wrap selection to last item
      domEvent.keyDown(document, { key: 'ArrowDown' })

      // make sure first item is selected
      const firstActive = container.querySelector('.result.active')
      expect(firstActive.textContent).to.contain(opts[0].title)

      // Note: For some reason the first item's offsetTop is not 0 so we need
      // to find the item's offsetTop and ensure it's at the top.
      const selectedItem = document.querySelector('.ui.search .results.visible .result.active')
      const isMenuScrolledToTop = menu.scrollTop === selectedItem.offsetTop
      expect(isMenuScrolledToTop).to.equal(true)
    })
    it('closes the menu', () => {
      const { container } = wrapperMount(
        <Search results={options} minCharacters={0} selectFirstResult />,
      )

      openSearchResults(container)
      searchResultsIsOpen(container)

      // choose an item closes
      domEvent.keyDown(document, { key: 'Enter' })
      searchResultsIsClosed(container)
    })
    it('uses custom renderer', () => {
      const resultSpy = sandbox.spy(() => <div className='custom-result' />)
      const { container } = wrapperMount(
        <Search results={options} minCharacters={0} resultRenderer={resultSpy} />,
      )

      expect(resultSpy).to.have.been.called.exactly(options.length)
      expect(container.querySelector('.result .custom-result')).toBeTruthy()
    })
  })

  describe('category', () => {
    const categoryLength = 3
    const categoryResultsLength = 5
    const categoryOptions = _.range(0, categoryLength).reduce((memo, index) => {
      const category = `${faker.hacker.noun()}-${index}`

      // eslint-disable-next-line no-param-reassign
      memo[category] = {
        name: category,
        results: getOptions(categoryResultsLength),
      }

      return memo
    }, {})

    it('defaults to the first item with selectFirstResult', () => {
      const { container } = wrapperMount(
        <Search results={categoryOptions} category minCharacters={0} selectFirstResult />,
      )

      const categories = container.querySelectorAll('.category')
      const results = container.querySelectorAll('.result')
      expect(categories[0].classList.contains('active')).to.equal(true)
      expect(results[0].classList.contains('active')).to.equal(true)
    })
    it('moves down on arrow down when open', () => {
      const { container } = wrapperMount(
        <Search results={categoryOptions} category minCharacters={0} selectFirstResult />,
      )

      // open
      openSearchResults(container)
      searchResultsIsOpen(container)

      // arrow to new category
      _.times(categoryResultsLength, () => domEvent.keyDown(document, { key: 'ArrowDown' }))

      // selection moved to second item
      const categories = container.querySelectorAll('.category')
      const results = container.querySelectorAll('.result')
      expect(categories[0].classList.contains('active')).to.equal(false)
      expect(results[0].classList.contains('active')).to.equal(false)
      expect(categories[1].classList.contains('active')).to.equal(true)
      expect(results[categoryResultsLength].classList.contains('active')).to.equal(true)
    })
    it('moves up on arrow up when open', () => {
      const { container } = wrapperMount(
        <Search results={categoryOptions} category minCharacters={0} />,
      )

      // open
      openSearchResults(container)
      searchResultsIsOpen(container)

      // arrow up
      domEvent.keyDown(document, { key: 'ArrowUp' })

      // selection moved to last item
      const categories = container.querySelectorAll('.category')
      const results = container.querySelectorAll('.result')
      expect(categories[0].classList.contains('active')).to.equal(false)
      expect(results[0].classList.contains('active')).to.equal(false)
      expect(categories[categoryLength - 1].classList.contains('active')).to.equal(true)
      expect(
        results[categoryLength * categoryResultsLength - 1].classList.contains('active'),
      ).to.equal(true)
    })
    it('uses custom renderer', () => {
      const categorySpy = sandbox.spy(() => <div className='custom-category' />)
      const resultSpy = sandbox.spy(() => <div className='custom-result' />)
      const { container } = wrapperMount(
        <Search
          results={categoryOptions}
          category
          minCharacters={0}
          categoryRenderer={categorySpy}
          resultRenderer={resultSpy}
        />,
      )

      expect(categorySpy).to.have.been.called.exactly(categoryLength + 1)
      expect(resultSpy).to.have.been.called.exactly(categoryLength * categoryResultsLength)
      expect(container.querySelector('.category .name .custom-category')).toBeTruthy()
      expect(container.querySelector('.result .custom-result')).toBeTruthy()
    })
    it('uses default noResultsMessage', () => {
      const { container } = wrapperMount(<Search results={{}} category minCharacters={0} />)
      const message = container.querySelector('.message.empty')
      expect(message.textContent).to.contain('No results found.')
    })
    it('closes the menu', () => {
      const { container } = wrapperMount(
        <Search results={categoryOptions} category minCharacters={0} selectFirstResult />,
      )

      openSearchResults(container)
      searchResultsIsOpen(container)

      // choose an item closes
      domEvent.keyDown(document, { key: 'Enter' })
      searchResultsIsClosed(container)
    })
  })

  describe('value', () => {
    it('updates text when value changed', () => {
      const initialValue = faker.hacker.noun()
      const nextValue = faker.hacker.noun()

      const { container, rerender } = wrapperMount(
        <Search results={options} minCharacters={0} value={initialValue} />,
      )
      const input = container.querySelector('.prompt')
      expect(input.value).to.equal(initialValue)

      rerender(<Search results={options} minCharacters={0} value={nextValue} />)
      expect(container.querySelector('.prompt').value).to.equal(nextValue)
    })
  })

  describe('results menu', () => {
    it('opens after min characters', () => {
      const title = options[0].title
      const { container } = wrapperMount(<Search results={options} minCharacters={2} />)
      const input = container.querySelector('input.prompt')

      searchResultsIsClosed(container)

      fireEvent.change(input, { target: { value: title.slice(0, 1) } })
      searchResultsIsClosed(container)

      fireEvent.change(input, { target: { value: title.slice(0, 2) } })
      searchResultsIsOpen(container)
    })

    it('opens (and remains open) when clicking the input', () => {
      const { container } = wrapperMount(<Search results={options} minCharacters={0} />)
      const prompt = container.querySelector('input.prompt')

      fireEvent.click(prompt, nativeEvent)
      searchResultsIsOpen(container)

      // Stays open after multiple clicks on the input
      fireEvent.click(prompt, nativeEvent)
      searchResultsIsOpen(container)
    })

    it('closes on menu item click', () => {
      const { container } = wrapperMount(<Search results={options} minCharacters={0} />)
      const item = container.querySelectorAll('.result')[_.random(options.length - 1)]

      // open
      openSearchResults(container)
      searchResultsIsOpen(container)

      // select item
      fireEvent.click(item, nativeEvent)
      searchResultsIsClosed(container)
    })

    it('blurs after menu item click (mousedown)', () => {
      const { container } = wrapperMount(<Search results={options} minCharacters={0} />)
      const item = container.querySelectorAll('.result')[_.random(options.length - 1)]

      // open
      openSearchResults(container)
      searchResultsIsOpen(container)

      // select item
      fireEvent.mouseDown(item)
      searchResultsIsOpen(container)
      fireEvent.click(item, nativeEvent)
      searchResultsIsClosed(container)
    })

    it('closes on click outside', () => {
      const { container } = wrapperMount(<Search results={options} minCharacters={0} />)

      // open
      openSearchResults(container)
      searchResultsIsOpen(container)

      // click outside
      domEvent.click(document.body)
      searchResultsIsClosed(container)
    })

    it('closes on esc key', () => {
      const { container } = wrapperMount(<Search results={options} minCharacters={0} />)

      // open
      openSearchResults(container)
      searchResultsIsOpen(container)

      // esc
      domEvent.keyDown(document, { key: 'Escape' })
      searchResultsIsClosed(container)
    })
  })

  describe('open', () => {
    it('defaultOpen opens the menu when true', () => {
      const { container } = wrapperMount(<Search results={options} minCharacters={0} defaultOpen />)
      searchResultsIsOpen(container)
    })
    it('defaultOpen stays open on focus', () => {
      const { container } = wrapperMount(<Search results={options} minCharacters={0} defaultOpen />)
      fireEvent.focus(container.firstChild)
      searchResultsIsOpen(container)
    })
    it('defaultOpen closes the menu when false', () => {
      const { container } = wrapperMount(
        <Search results={options} minCharacters={0} defaultOpen={false} />,
      )
      searchResultsIsClosed(container)
    })
    it('opens the menu when true', () => {
      const { container } = wrapperMount(<Search results={options} minCharacters={0} open />)
      searchResultsIsOpen(container)
    })
    it('closes the menu when false', () => {
      const { container } = wrapperMount(
        <Search results={options} minCharacters={0} open={false} />,
      )
      searchResultsIsClosed(container)
    })
    it('closes the menu when toggled from true to false', () => {
      const { container, rerender } = wrapperMount(
        <Search results={options} minCharacters={0} open />,
      )
      rerender(<Search results={options} minCharacters={0} open={false} />)
      searchResultsIsClosed(container)
    })
    it('opens the menu when toggled from false to true', () => {
      const { container, rerender } = wrapperMount(
        <Search results={options} minCharacters={0} open={false} />,
      )
      rerender(<Search results={options} minCharacters={0} open />)
      searchResultsIsOpen(container)
    })
  })

  describe('onBlur', () => {
    it('is called with (event, data) on search input blur', () => {
      const onBlur = sandbox.spy()
      const { container } = wrapperMount(<Search results={options} onBlur={onBlur} />)
      fireEvent.blur(container.firstChild, nativeEvent)

      onBlur.should.have.been.calledOnce()
      onBlur.should.have.been.calledWithMatch(nativeEvent, { onBlur, results: options })
    })

    it('is not called on an item click', () => {
      const onBlur = sandbox.spy()
      const { container } = wrapperMount(<Search results={options} onBlur={onBlur} />)

      openSearchResults(container)
      const item = container.querySelector('.result')
      fireEvent.click(item, nativeEvent)
      onBlur.should.have.not.been.called()
    })
  })

  describe('onFocus', () => {
    it('is called with (event, data) on search input focus', () => {
      const onFocus = sandbox.spy()
      const { container } = wrapperMount(<Search results={options} onFocus={onFocus} />)
      fireEvent.focus(container.firstChild, nativeEvent)

      onFocus.should.have.been.calledOnce()
      onFocus.should.have.been.calledWithMatch(nativeEvent, { onFocus, results: options })
    })
  })

  describe('onResultSelect', () => {
    let spy
    beforeEach(() => {
      spy = sandbox.spy()
    })

    it('is called with event and value on item click', () => {
      const randomIndex = _.random(options.length - 1)
      const randomResult = options[randomIndex]
      const { container } = wrapperMount(
        <Search results={options} minCharacters={0} onResultSelect={spy} />,
      )

      // open
      openSearchResults(container)
      searchResultsIsOpen(container)

      const item = container.querySelectorAll('.result')[randomIndex]
      fireEvent.click(item, nativeEvent)

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch(
        {},
        {
          minCharacters: 0,
          result: randomResult,
          results: options,
        },
      )
    })
    it('is called with event and value when pressing enter on a selected item', () => {
      const firstResult = options[0]
      const { container } = wrapperMount(
        <Search results={options} minCharacters={0} onResultSelect={spy} selectFirstResult />,
      )

      // open
      openSearchResults(container)
      searchResultsIsOpen(container)

      domEvent.keyDown(document, { key: 'Enter' })

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch({}, { result: firstResult })
    })
    it('is not called when updating the value prop', () => {
      const value = _.sample(options).title
      const next = _.sample(_.without(options, value)).title

      const { rerender } = wrapperMount(
        <Search results={options} minCharacters={0} value={value} onResultSelect={spy} />,
      )
      rerender(<Search results={options} minCharacters={0} value={next} onResultSelect={spy} />)

      spy.should.not.have.been.called()
    })
    it('does not call onResultSelect on query change', () => {
      const onResultSelectSpy = sandbox.spy()
      const { container } = wrapperMount(
        <Search results={options} minCharacters={0} onResultSelect={onResultSelectSpy} />,
      )

      // simulate search
      const input = container.querySelector('input.prompt')
      fireEvent.change(input, { target: { value: faker.hacker.noun() } })

      onResultSelectSpy.should.not.have.been.called()
    })
  })

  describe('onSearchChange', () => {
    it('is called with (event, value) on search input change', () => {
      const spy = sandbox.spy()
      const { container } = wrapperMount(
        <Search results={options} minCharacters={0} onSearchChange={spy} />,
      )
      const input = container.querySelector('input.prompt')
      fireEvent.change(input, { target: { value: 'a' }, stopPropagation: _.noop })

      spy.should.have.been.calledOnce()
      spy.should.have.been.calledWithMatch(
        { target: { value: 'a' } },
        {
          minCharacters: 0,
          results: options,
          value: 'a',
        },
      )
    })
  })

  describe('onSelectionChange', () => {
    it('is called with (event, data) when the active selection index is changed', () => {
      const onSelectionChange = sandbox.spy()

      const { container } = wrapperMount(
        <Search
          minCharacters={0}
          onSelectionChange={onSelectionChange}
          results={options}
          selectFirstResult
        />,
      )
      openSearchResults(container)
      domEvent.keyDown(document, { key: 'ArrowDown' })

      onSelectionChange.should.have.been.calledOnce()
      onSelectionChange.should.have.been.calledWithMatch(
        {},
        {
          minCharacters: 0,
          result: options[1],
          results: options,
        },
      )
    })
  })

  describe('results prop', () => {
    it('adds the onClick handler to all items', () => {
      const { container } = wrapperMount(<Search results={options} minCharacters={0} />)
      const items = container.querySelectorAll('.result')
      items.forEach((item) => {
        expect(item.hasAttribute('onClick')).to.equal(true)
      })
    })

    it('renders new options when options change', () => {
      const customOptions = [
        { title: 'abra', description: 'abra' },
        { title: 'cadabra', description: 'cadabra' },
        { title: 'bang', description: 'bang' },
      ]
      const { container, rerender } = wrapperMount(
        <Search results={customOptions} minCharacters={0} />,
      )

      let results = container.querySelectorAll('.result')
      expect(results.length).to.equal(3)

      rerender(
        <Search
          results={[...customOptions, { title: 'bar', description: 'bar' }]}
          minCharacters={0}
        />,
      )
      results = container.querySelectorAll('.result')
      expect(results.length).to.equal(4)

      const newItem = results[3]
      expect(newItem.textContent).to.contain('bar')
    })

    it('passes options as props', () => {
      const customOptions = [
        { title: 'abra', description: 'abra', 'data-foo': 'someValue' },
        { title: 'cadabra', description: 'cadabra', 'data-foo': 'someValue' },
        { title: 'bang', description: 'bang', 'data-foo': 'someValue' },
      ]
      const { container } = wrapperMount(<Search results={customOptions} minCharacters={0} />)
      const results = container.querySelectorAll('.result')
      results.forEach((result) => {
        expect(result.getAttribute('data-foo')).to.equal('someValue')
      })
    })
    it('ignores search value', () => {
      const { container } = wrapperMount(
        <Search results={options} minCharacters={0} selectFirstResult />,
      )

      openSearchResults(container)
      searchResultsIsOpen(container)

      // search for something we know will not exist
      const input = container.querySelector('input.prompt')
      fireEvent.change(input, { target: { value: '_________________' } })

      const results = container.querySelectorAll('.result')
      expect(results.length).to.equal(options.length)
    })
  })

  describe('no results message', () => {
    it('is shown when there are no results', () => {
      const { container, rerender } = wrapperMount(<Search results={options} minCharacters={0} />)
      expect(container.querySelector('.message.empty')).toBeFalsy()

      rerender(<Search results={[]} minCharacters={0} />)
      expect(container.querySelector('.message.empty')).toBeTruthy()
    })
    it('uses default noResultsMessage', () => {
      const { container } = wrapperMount(<Search results={[]} minCharacters={0} />)
      const header = container.querySelector('.message.empty .header')
      expect(header.textContent).to.contain('No results found.')
    })
    it('uses custom string for noResultsMessage', () => {
      const { container } = wrapperMount(
        <Search results={[]} minCharacters={0} noResultsMessage='Something custom' />,
      )
      const header = container.querySelector('.message.empty .header')
      expect(header.textContent).to.contain('Something custom')
    })
    it('uses custom component for noResultsMessage', () => {
      const { container } = wrapperMount(
        <Search results={[]} minCharacters={0} noResultsMessage={<span>Test</span>} />,
      )
      expect(container.querySelector('.message.empty .header span')).toBeTruthy()
    })
    it('uses custom noResultsDescription if present', () => {
      const { container } = wrapperMount(
        <Search results={[]} minCharacters={0} noResultsDescription='Something custom' />,
      )
      const header = container.querySelector('.message.empty .header')
      const description = container.querySelector('.message.empty .description')
      expect(header.textContent).to.contain('No results found.')
      expect(description.textContent).to.contain('Something custom')
    })
    it('uses no noResultsMessage', () => {
      const { container } = wrapperMount(
        <Search results={[]} minCharacters={0} noResultsMessage='' />,
      )
      const header = container.querySelector('.message.empty .header')
      expect(header.textContent).to.equal('')
    })
    it('shows no message with showNoResults=false', () => {
      const { container } = wrapperMount(
        <Search results={[]} minCharacters={0} showNoResults={false} />,
      )
      expect(container.querySelector('.message.empty')).toBeFalsy()
    })
  })

  describe('input', () => {
    it(`merges nested shorthand props for the <input>`, () => {
      const { container } = wrapperMount(
        <Search input={{ input: { className: 'foo', tabIndex: '-1' } }} />,
      )
      const input = container.querySelector('input')

      expect(input.tabIndex).to.equal(-1)
      expect(input.classList.contains('foo')).to.equal(true)
      expect(input.classList.contains('prompt')).to.equal(true)
    })

    it(`will not merge for a function`, () => {
      // TODO: V4 remove this test and simplify the implementation
      consoleUtil.disableOnce()

      const { container } = wrapperMount(
        <Search input={{ input: (Component, props) => <Component {...props} /> }} />,
      )
      const input = container.querySelector('input')

      expect(input.getAttribute('autoComplete')).to.equal('off')
      expect(input.classList.contains('prompt')).to.equal(false)
    })

    it(`"placeholder" in passed to an "input"`, () => {
      const { container } = wrapperMount(<Search placeholder='foo' />)
      const input = container.querySelector('input')

      expect(input.placeholder).to.equal('foo')
    })
  })

  describe('input props', () => {
    // Search handles some of html attrs
    const props = _.without(htmlInputAttrs, 'defaultValue', 'type')
    const booleanProps = ['disabled']

    props.forEach((propName) => {
      it(`passes "${propName}" to the <input>`, () => {
        const propValue = _.includes(booleanProps, propName) ? true : 'off'

        const { container } = wrapperMount(<Search {...{ [propName]: propValue }} />)
        const input = container.querySelector('input')
        expect(input.getAttribute(propName)).to.equal(propValue.toString())
      })
    })
  })
})
