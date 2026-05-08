// Heads Up!
//
// Do not replace this with named exports.
// We need to export an object here for browser builds.
// Otherwise, we end up with every component on the window.
import * as allExports from './index'

export { allExports as default }
