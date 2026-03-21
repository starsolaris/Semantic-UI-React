import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'

const srcAlias = { find: 'src', replacement: path.resolve(__dirname, 'src') }
const testAlias = { find: 'test', replacement: path.resolve(__dirname, 'test') }
const suiAlias = { find: 'semantic-ui-react', replacement: path.resolve(__dirname, 'src/index.js') }

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/specs/**/*-test.js'],
    setupFiles: ['test/setup.js'],
    testTimeout: 10000,
  },
  resolve: {
    alias: [srcAlias, testAlias, suiAlias],
  },
  esbuild: {
    loader: 'jsx',
    include: ['src/**/*', 'test/**/*'],
    exclude: [],
  },
})
