import * as ReactIs from 'react-is'

const getPropKeys = (propTypes) => (propTypes ? Object.keys(propTypes) : [])

/**
 * Gets proper props for a component.
 *
 * @param {React.ElementType} Component
 * @return {Object}
 */
export default function getComponentProps(Component) {
  if (Component.$$typeof === ReactIs.Memo) {
    return getComponentProps(Component.type)
  }

  const autoControlledProps = Component.autoControlledProps || []
  const propTypes = Component.propTypes || {}
  const handledProps = [
    ...new Set([
      ...(Component.handledProps || []),
      ...autoControlledProps,
      ...getPropKeys(propTypes),
    ]),
  ].sort()

  return {
    autoControlledProps,
    handledProps,
    propTypes,
  }
}
