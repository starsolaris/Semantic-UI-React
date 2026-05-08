import { fireEvent } from '@testing-library/dom'

// ----------------------------------------
// Simulate DOM Events on real DOM nodes
// ----------------------------------------

const eventDispatchers = {
  click: fireEvent.click,
  keydown: fireEvent.keyDown,
  mousedown: fireEvent.mouseDown,
  mouseenter: fireEvent.mouseEnter,
  mouseleave: fireEvent.mouseLeave,
  mouseover: fireEvent.mouseOver,
  mouseup: fireEvent.mouseUp,
  resize: fireEvent.resize,
  scroll: fireEvent.scroll,
}

/**
 * Generic method for dispatching an event on a DOM node.
 * @param {String|Object} node A querySelector string or DOM node.
 * @param {String} eventType A DOMString
 * @param {Object} [data] Additional event data.
 * @returns {Object} The event
 */
export const fire = (node, eventType, data = {}) => {
  const DOMNode = typeof node === 'string' ? document.querySelector(node) : node
  const dispatch = eventDispatchers[eventType]

  if (!DOMNode) {
    throw new Error(`Unable to find DOM node for event "${eventType}"`)
  }

  if (!dispatch) {
    throw new Error(`Unsupported DOM event type "${eventType}"`)
  }

  return dispatch(DOMNode, data)
}

/**
 * Dispatch a 'click' event on a DOM node.
 * @param {String|Object} node A querySelector string or DOM node.
 * @param {Object} [data] Additional event data.
 * @returns {Object} The event
 */
export const click = (node, data) => fire(node, 'click', data)

/**
 * Dispatch a 'keydown' event on a DOM node.
 * @param {String|Object} node A querySelector string or DOM node.
 * @param {Object} [data] Additional event data.
 * @returns {Object} The event
 */
export const keyDown = (node, data) => fire(node, 'keydown', data)

/**
 * Dispatch a 'mousedown' event on a DOM node.
 * @param {String|Object} node A querySelector string or DOM node.
 * @param {Object} [data] Additional event data.
 * @returns {Object} The event
 */
export const mouseDown = (node, data) => fire(node, 'mousedown', data)

/**
 * Dispatch a 'mouseenter' event on a DOM node.
 * @param {String|Object} node A querySelector string or DOM node.
 * @param {Object} [data] Additional event data.
 * @returns {Object} The event
 */
export const mouseEnter = (node, data) => fire(node, 'mouseenter', data)

/**
 * Dispatch a 'mouseleave' event on a DOM node.
 * @param {String|Object} node A querySelector string or DOM node.
 * @param {Object} [data] Additional event data.
 * @returns {Object} The event
 */
export const mouseLeave = (node, data) => fire(node, 'mouseleave', data)

/**
 * Dispatch a 'mouseover' event on a DOM node.
 * @param {String|Object} node A querySelector string or DOM node.
 * @param {Object} [data] Additional event data.
 * @returns {Object} The event
 */
export const mouseOver = (node, data) => fire(node, 'mouseover', data)

/**
 * Dispatch a 'mouseup' event on a DOM node.
 * @param {String|Object} node A querySelector string or DOM node.
 * @param {Object} [data] Additional event data.
 * @returns {Object} The event
 */
export const mouseUp = (node, data) => fire(node, 'mouseup', data)

/**
 * Dispatch a 'resize' event on a DOM node.
 * @param {String|Object} node A querySelector string or DOM node.
 * @param {Object} [data] Additional event data.
 * @returns {Object} The event
 */
export const resize = (node, data) => fire(node, 'resize', data)

/**
 * Dispatch a 'scroll' event on a DOM node.
 * @param {String|Object} node A querySelector string or DOM node.
 * @param {Object} [data] Additional event data.
 * @returns {Object} The event
 */
export const scroll = (node, data) => fire(node, 'scroll', data)

export default {
  fire,
  click,
  keyDown,
  mouseEnter,
  mouseLeave,
  mouseOver,
  mouseDown,
  mouseUp,
  resize,
  scroll,
}
