import isBrowser from 'src/lib/isBrowser'

const importFreshIsBrowser = async () => {
  vi.resetModules()
  return (await import('src/lib/isBrowser')).default
}

describe('isBrowser', () => {
  describe('browser', () => {
    it('should return true in a browser', () => {
      // tests are run in a browser, this should be true
      isBrowser().should.be.true()
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should return false when there is no document', async () => {
      vi.stubGlobal('document', undefined)
      ;(await importFreshIsBrowser())().should.be.false()

      vi.stubGlobal('document', null)
      ;(await importFreshIsBrowser())().should.be.false()
    })

    it('should return false when there is no window', async () => {
      vi.stubGlobal('window', undefined)
      ;(await importFreshIsBrowser())().should.be.false()

      vi.stubGlobal('window', null)
      ;(await importFreshIsBrowser())().should.be.false()
    })
  })

  describe('server-side', () => {
    before(() => {
      isBrowser.override = false
    })

    after(() => {
      isBrowser.override = null
    })

    it('should return override value', () => {
      // tests are run in a browser, this should be true
      isBrowser().should.be.false()
    })
  })
})
