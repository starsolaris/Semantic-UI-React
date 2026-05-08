import fs from 'fs'
import _ from 'lodash'
import path from 'path'

import { customPropTypes } from 'src/lib'
import { getComponentName, getComponentProps } from 'test/utils'
import {
  getNodes,
  getInterfaces,
  hasAnySignature,
  getComponentType,
  isForwardRefComponent,
} from './tsHelpers'

const isShorthand = (propType) =>
  _.includes(
    [
      customPropTypes.collectionShorthand,
      customPropTypes.contentShorthand,
      customPropTypes.itemShorthand,
    ],
    propType,
  )
const shorthandMap = {
  SemanticShorthandContent: customPropTypes.contentShorthand,
  SemanticShorthandItem: customPropTypes.itemShorthand,
  SemanticShorthandCollection: customPropTypes.collectionShorthand,
}
const srcRoot = path.join(process.cwd(), 'src')

const getRelativeTypingsPath = (filePath) =>
  path.relative(srcRoot, filePath).split(path.sep).join('/')

const findExactTypingsFile = (dir, displayName) => {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))

  for (const entry of entries) {
    if (entry.isFile() && entry.name === `${displayName}.d.ts`) {
      return path.join(dir, entry.name)
    }
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const match = findExactTypingsFile(path.join(dir, entry.name), displayName)

      if (match) return match
    }
  }

  return null
}

const findIndexTypingsFile = (dir, displayName) => {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))

  if (path.basename(dir) === displayName) {
    const indexFile = path.join(dir, 'index.d.ts')

    if (fs.existsSync(indexFile)) {
      return indexFile
    }
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const match = findIndexTypingsFile(path.join(dir, entry.name), displayName)

      if (match) return match
    }
  }

  return null
}

const resolveTypingsFile = (displayName) => {
  const exactMatch = findExactTypingsFile(srcRoot, displayName)

  if (exactMatch) {
    return getRelativeTypingsPath(exactMatch)
  }

  const indexMatch = findIndexTypingsFile(srcRoot, displayName)

  return indexMatch ? getRelativeTypingsPath(indexMatch) : null
}

/**
 * Assert Component has the valid typings.
 * @param {React.Component|Function} Component A component that should conform.
 * @param {Object} [options={}]
 * @param {array} [options.ignoredTypingsProps=[]] Props that will be ignored in tests.
 * @param {Object} [options.requiredProps={}] Props required to render Component without errors or warnings.
 * @param {Object} [options.forwardsRef=true] Indicates if component forwards refs.
 */
export default function hasValidTypings(Component, options = {}) {
  const { ignoredTypingsProps = [], forwardsRef = true, requiredProps } = options
  const displayName = getComponentName(Component)
  const tsFile = resolveTypingsFile(displayName)
  const tsContent = fs.readFileSync(path.join(srcRoot, tsFile), 'utf8')

  describe('typings', () => {
    describe('structure', () => {
      it(`${tsFile} exists`, () => {
        tsContent.should.to.not.equal(false)
      })
    })

    const tsNodes = getNodes(tsFile, tsContent)
    const componentType = getComponentType(tsNodes, displayName)

    const propsInterfaceName = `${displayName}Props`
    const strictInterfaceName = `Strict${displayName}Props`

    const propsInterfaceObject = _.find(getInterfaces(tsNodes), { name: propsInterfaceName })
    const strictInterfaceObject = _.find(getInterfaces(tsNodes), { name: strictInterfaceName })

    describe(`component ${displayName}`, () => {
      it('has component type', () => {
        componentType.should.to.be.an('object')
      })

      if (forwardsRef) {
        it('is ForwardRefComponent', () => {
          isForwardRefComponent(componentType).should.to.equal(true)
        })
      }
    })

    describe(`interface ${propsInterfaceName}`, () => {
      it('has interface', () => {
        propsInterfaceObject.should.to.be.an('object')
      })

      it('is exported', () => {
        const { exported } = propsInterfaceObject
        exported.should.to.equal(true)
      })
    })

    describe(`interface ${strictInterfaceName}`, () => {
      it('has interface', () => {
        strictInterfaceObject.should.to.be.an('object')
      })

      it('is exported', () => {
        const { exported } = strictInterfaceObject
        exported.should.to.equal(true)
      })
    })

    describe('props', () => {
      const { props } = strictInterfaceObject

      it('has any signature', () => {
        hasAnySignature(tsNodes).should.to.equal(true)
      })

      it('match the typings interface', () => {
        const componentPropTypes = getComponentProps(Component).propTypes
        const componentProps = _.keys(componentPropTypes)
        const interfaceProps = _.without(_.map(props, 'name'), ...ignoredTypingsProps)

        componentProps.forEach((propName, index) => {
          interfaceProps.should.include(
            propName,
            `propTypes define "${propName}" but it is missing in typings`,
          )
          interfaceProps[index].should.equal(
            propName,
            `propTypes define "${propName}" but its order doesn't match typings`,
          )
        })

        interfaceProps.forEach((propName) => {
          componentProps.should.include(
            propName,
            `Typings define prop "${propName}" but it is missing in propTypes`,
          )
        })
      })

      it('isRequired props match required typings', () => {
        const componentRequired = _.keys(requiredProps)
        const interfaceRequired = _.map(_.filter(props, ['required', true]), 'name')

        componentRequired.forEach((propName) => {
          interfaceRequired.should.include(
            propName,
            `Tests require prop "${propName}" but it is optional in typings`,
          )
        })

        interfaceRequired.forEach((propName) => {
          componentRequired.should.include(
            propName,
            `Typings require "${propName}" but it is optional in tests`,
          )
        })
      })
    })

    const componentPropTypes = _.get(Component, 'propTypes')
    const componentShorthands = _.pickBy(componentPropTypes, isShorthand)

    if (_.size(componentShorthands) > 0) {
      describe('shorthands', () => {
        const { shorthands } = strictInterfaceObject

        _.forEach(componentShorthands, (propType, propName) => {
          it(`"${propName}" should have the correct shorthand type `, () => {
            const { type } = _.find(shorthands, ['name', propName])

            shorthandMap[type].should.to.equal(propType)
          })
        })
      })
    }
  })
}
