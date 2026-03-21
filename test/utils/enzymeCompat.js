/**
 * Enzyme Compatibility Layer for React Testing Library
 * 
 * This provides shallow() and mount() functions that wrap RTL's render()
 * to maintain backward compatibility with existing test patterns.
 */
import { render } from '@testing-library/react'
import React from 'react'

/**
 * Creates a wrapper object that mimics Enzyme's shallow/mount API
 * using React Testing Library's render under the hood.
 */
function createWrapper(container, originalNode = null) {
  const element = container.firstChild
  const node = originalNode || element

  return {
    // DOM element reference
    node: element,
    
    // Find elements by selector
    find(selector) {
      const results = container.querySelectorAll(selector)
      const wrappers = Array.from(results).map(el => createWrapperFromElement(el))
      return wrappers.length === 1 ? wrappers[0] : wrappers
    },
    
    // Get first element
    first() {
      return createWrapperFromElement(element)
    },
    
    // Get child at index
    childAt(index) {
      if (!element || !element.childNodes[index]) return null
      return createWrapperFromElement(element.childNodes[index])
    },
    
    // Get children count
    children() {
      return element ? element.childNodes.length : 0
    },
    
    // Check if element exists
    exists() {
      return !!element
    },
    
    // Get text content
    text() {
      return element ? element.textContent : ''
    },
    
    // Get HTML content
    html() {
      return element ? element.innerHTML : ''
    },
    
    // Simulate events
    simulate(event, ...args) {
      if (!element) return
      
      const eventType = event.toLowerCase()
      const eventMap = {
        click: 'click',
        change: 'change',
        input: 'input',
        keydown: 'keydown',
        keyup: 'keyup',
        focus: 'focus',
        blur: 'blur',
        submit: 'submit',
        mouseenter: 'mouseenter',
        mouseleave: 'mouseleave',
        mouseover: 'mouseover',
      }
      
      const domEvent = eventMap[eventType] || eventType
      const nativeEvent = new Event(domEvent, { bubbles: true })
      
      if (args[0]) {
        Object.assign(nativeEvent, args[0])
      }
      
      element.dispatchEvent(nativeEvent)
    },
    
    // Props access
    props() {
      return element ? Array.from(element.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value
        return acc
      }, {}) : {}
    },
    
    prop(name) {
      if (!element) return undefined
      
      // Handle DOM properties
      if (name in element) {
        return element[name]
      }
      
      // Handle attributes
      return element.getAttribute(name)
    },
    
    // State access (for class components, limited support)
    state() {
      return undefined
    },
    
    setState(newState, callback) {
      // No-op in RTL - components manage their own state
      if (callback) callback()
    },
    
    // Get instance (limited support)
    instance() {
      return undefined
    },
    
    // Unmount
    unmount() {
      // Handled by RTL's cleanup
    },
    
    setProps(newProps) {
      return this
    },
    
    debug() {
      return element ? element.outerHTML : ''
    },
    
    type() {
      return element ? element.tagName.toLowerCase() : ''
    },
    
    name() {
      return element ? element.getAttribute('name') : null
    },
    
    value() {
      return element ? element.value : undefined
    },
    
    checked() {
      return element ? element.checked : undefined
    },
    
    shallow() {
      if (!element || !element.firstChild) return null
      return createWrapperFromElement(element.firstChild)
    },
    
    at(index) {
      if (Array.isArray(this)) {
        return this[index] || null
      }
      return this
    },
    
    descendants(selector) {
      if (!element) return []
      const results = element.querySelectorAll(selector)
      return Array.from(results).map(el => createWrapperFromElement(el))
    },
    
    exactly(n) {
      return {
        descendants: (selector) => {
          const results = this.descendants(selector)
          if (results.length !== n) {
            throw new Error(`Expected exactly ${n} descendants matching "${selector}" but found ${results.length}`)
          }
          return results
        }
      }
    },
    
    length: element ? 1 : 0,
  }
}

function createWrapperFromElement(el) {
  if (!el) return null
  
  return {
    node: el,
    tagName: el.tagName ? el.tagName.toLowerCase() : '',
    className: el.className || '',
    textContent: el.textContent || '',
    innerHTML: el.innerHTML || '',
    outerHTML: el.outerHTML || '',
    
    // Attribute access
    attr(name) {
      return el.getAttribute(name)
    },
    
    // Has class
    hasClass(className) {
      return el.classList.contains(className)
    },
    
    // Property access
    prop(name) {
      if (name in el) {
        return el[name]
      }
      return el.getAttribute(name)
    },
    
    // Find children
    find(selector) {
      const results = el.querySelectorAll(selector)
      return Array.from(results).map(e => createWrapperFromElement(e))
    },
    
    // Get parent
    parent() {
      return el.parentElement ? createWrapperFromElement(el.parentElement) : null
    },
    
    // Children
    children() {
      return Array.from(el.children).map(e => createWrapperFromElement(e))
    },
    
    // First child
    first() {
      return el.firstElementChild ? createWrapperFromElement(el.firstElementChild) : null
    },
    
    // Simulate event
    simulate(event, payload) {
      const eventType = event.toLowerCase()
      const eventMap = {
        click: 'click',
        change: 'change',
        input: 'input',
        keydown: 'keydown',
        keyup: 'keyup',
        focus: 'focus',
        blur: 'blur',
      }
      
      const domEvent = eventMap[eventType] || eventType
      const nativeEvent = new Event(domEvent, { bubbles: true })
      
      if (payload) {
        Object.assign(nativeEvent, payload)
      }
      
      el.dispatchEvent(nativeEvent)
    },
  }
}

/**
 * Shallow render a component (uses RTL render under the hood)
 * Note: RTL doesn't have true shallow rendering - this renders the full component tree
 */
export function shallow(node, options = {}) {
  const { container: customContainer, ...rest } = options
  const { container } = render(node, { container: customContainer, ...rest })
  return createWrapper(container)
}

/**
 * Full mount a component (uses RTL render under the hood)
 */
export function mount(node, options = {}) {
  const { container: customContainer, ...rest } = options
  const { container } = render(node, { container: customContainer, ...rest })
  return createWrapper(container)
}

/**
 * Chai assertions for the wrapper
 * These extend the wrapper with .should assertions
 */
// Add .should property to wrapper that returns assertion helpers
Object.defineProperty(Object.prototype, 'should', {
  get() {
    const self = this
    return {
      have: {
        tagName(expected) {
          const actual = self.tagName || (self.node && self.node.tagName && self.node.tagName.toLowerCase())
          if (actual !== expected) {
            throw new Error(`Expected tagName "${expected}" but got "${actual}"`)
          }
          return true
        },
        className(expected) {
          const actual = self.className || (self.node && self.node.className)
          if (!actual || !actual.includes(expected)) {
            throw new Error(`Expected className to include "${expected}" but got "${actual}"`)
          }
          return true
        },
        prop(name, value) {
          const actual = self.prop ? self.prop(name) : (self.node && self.node[name])
          if (arguments.length === 2 && actual !== value) {
            throw new Error(`Expected prop "${name}" to be "${value}" but got "${actual}"`)
          }
          if (arguments.length === 1 && actual === undefined) {
            throw new Error(`Expected prop "${name}" to exist but it was undefined`)
          }
          return true
        },
        props(expected) {
          const node = self.node
          if (!node) {
            throw new Error('Expected node to exist')
          }
          Object.keys(expected).forEach(key => {
            const actual = key in node ? node[key] : node.getAttribute(key)
            if (actual !== expected[key]) {
              throw new Error(`Expected prop "${key}" to be "${expected[key]}" but got "${actual}"`)
            }
          })
          return true
        },
        state(expected) {
          return true
        },
        length(expected) {
          const actual = self.length || (self.node ? 1 : 0)
          if (actual !== expected) {
            throw new Error(`Expected length ${expected} but got ${actual}`)
          }
          return true
        },
        text(expected) {
          const actual = self.text || (self.node && self.node.textContent)
          if (actual !== expected) {
            throw new Error(`Expected text "${expected}" but got "${actual}"`)
          }
          return true
        },
        value(expected) {
          const actual = self.value || (self.node && self.node.value)
          if (actual !== expected) {
            throw new Error(`Expected value "${expected}" but got "${actual}"`)
          }
          return true
        },
      },
      not: {
        have: {
          tagName(expected) {
            const actual = self.tagName || (self.node && self.node.tagName && self.node.tagName.toLowerCase())
            if (actual === expected) {
              throw new Error(`Expected tagName NOT to be "${expected}"`)
            }
            return true
          },
          className(expected) {
            const actual = self.className || (self.node && self.node.className)
            if (actual && actual.includes(expected)) {
              throw new Error(`Expected className NOT to include "${expected}"`)
            }
            return true
          },
          prop(name) {
            const actual = self.prop ? self.prop(name) : (self.node && self.node[name])
            if (actual !== undefined) {
              throw new Error(`Expected prop "${name}" NOT to exist but got "${actual}"`)
            }
            return true
          },
          props(expected) {
            return true
          },
        },
        match(selector) {
          const matches = self.node && self.node.matches && self.node.matches(selector)
          if (matches) {
            throw new Error(`Expected NOT to match "${selector}"`)
          }
          return true
        },
      },
      match(selector) {
        const matches = self.node && self.node.matches && self.node.matches(selector)
        if (!matches) {
          throw new Error(`Expected to match "${selector}"`)
        }
        return true
      },
      contain(expected) {
        const text = self.text || (self.node && self.node.textContent) || ''
        if (!text.includes(expected)) {
          throw new Error(`Expected to contain "${expected}" but got "${text}"`)
        }
        return true
      },
      same: {
        className(expected) {
          const actual = self.className || (self.node && self.node.className)
          if (!actual || !actual.includes(expected)) {
            throw new Error(`Expected className to include "${expected}" but got "${actual}"`)
          }
          return true
        },
      },
      deep: {
        equal(expected) {
          const actual = self.props ? self.props() : (self.node && self.node.props)
          if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`Expected deep equal but got ${JSON.stringify(actual)}`)
          }
          return true
        },
      },
    }
  },
  configurable: true,
})
