import _ from 'lodash'

export default (Component, subcomponents) => {
  const staticValues = _.values(Component)

  _.each(subcomponents, (subcomponent) => {
    it(`has sub component ${_.get(subcomponent, 'prototype.constructor.name')}`, () => {
      expect(staticValues).to.include(subcomponent)
    })
  })
}
