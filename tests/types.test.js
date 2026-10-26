/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const { execFileSync } = require('node:child_process')
const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
let consumer
let packed

function run(command, args, cwd = consumer) {
  try {
    return execFileSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe' })
  } catch (error) {
    throw new Error(`${command} ${args.join(' ')}\n${error.stdout || ''}${error.stderr || ''}`, { cause: error })
  }
}

function compilerPath(compiler) {
  return path.join(path.dirname(require.resolve(`${compiler}/package.json`)), 'bin/tsc')
}

beforeAll(() => {
  consumer = mkdtempSync(path.join(root, 'node_modules/.aio-lib-db-types-'))
  packed = Object.values(JSON.parse(run('npm', ['pack', '--json', '--ignore-scripts', '--pack-destination', consumer], root)))[0]
  const target = path.join(consumer, 'node_modules/@adobe/aio-lib-db')
  mkdirSync(target, { recursive: true })
  run('tar', ['-xzf', path.join(consumer, packed.filename), '--strip-components=1', '-C', target])
  writeFileSync(path.join(consumer, 'package.json'), '{"private":true}')
  copyFileSync(path.join(__dirname, 'types/consumer.ts'), path.join(consumer, 'consumer.ts'))
  writeFileSync(path.join(consumer, 'commonjs.cts'), `
import libDb = require('@adobe/aio-lib-db')
import { init } from '@adobe/aio-lib-db'
import * as namespace from '@adobe/aio-lib-db'
import { exercise } from './consumer.js'
void exercise(libDb)
void exercise(namespace)
void init({ token: 'compile-only' })
`)
  writeFileSync(path.join(consumer, 'esm.mts'), `
import libDb from '@adobe/aio-lib-db'
import { init } from '@adobe/aio-lib-db'
import { exercise } from './consumer.js'
void exercise(libDb)
void init({ token: 'compile-only' })
`)
}, 120000)

afterAll(() => {
  if (consumer) rmSync(consumer, { recursive: true, force: true })
})

test('packed runtime remains CommonJS with a default ESM import', () => {
  expect(run(process.execPath, ['-e', "console.log(Object.keys(require('@adobe/aio-lib-db')).join(','))"]).trim()).toBe('init')
  expect(run(process.execPath, ['--input-type=module', '-e',
    "import libDb, { init } from '@adobe/aio-lib-db'; console.log(Object.keys(libDb).join(','), init === libDb.init)"]).trim()).toBe('init true')
})

test('packed metadata exposes the shipped declaration through both resolution paths', () => {
  const manifest = JSON.parse(readFileSync(path.join(consumer, 'node_modules/@adobe/aio-lib-db/package.json'), 'utf8'))
  expect(packed.files.map(file => file.path)).toContain(manifest.types)
  expect(manifest.exports['.'].types).toBe(`./${manifest.types}`)
  expect(Object.keys(manifest.exports['.'])[0]).toBe('types')
})

test('CommonJS consumers can opt in to default-import interop', () => {
  writeFileSync(path.join(consumer, 'default.cts'), `
import libDb from '@adobe/aio-lib-db'
void libDb.init({ token: 'compile-only' })
`)
  writeFileSync(path.join(consumer, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022', module: 'Node16', moduleResolution: 'Node16',
      strict: true, noEmit: true, esModuleInterop: true, types: ['node']
    },
    files: ['default.cts']
  }))
  run(process.execPath, [compilerPath('typescript'), '-p', 'tsconfig.json'])
}, 120000)

describe.each(['typescript-5', 'typescript-6', 'typescript'])('%s packed consumer', compiler => {
  test.each([
    ['Node16', 'Node16'],
    ['NodeNext', 'NodeNext'],
    ['ESNext', 'Bundler']
  ])('%s / %s', (module, moduleResolution) => {
    const config = {
      compilerOptions: {
        target: 'ES2022', module, moduleResolution, strict: true,
        noEmit: true, skipLibCheck: false, types: ['node']
      },
      files: moduleResolution === 'Bundler' ? ['consumer.ts', 'esm.mts'] : ['consumer.ts', 'commonjs.cts', 'esm.mts']
    }
    writeFileSync(path.join(consumer, 'tsconfig.json'), JSON.stringify(config))
    run(process.execPath, [compilerPath(compiler), '-p', 'tsconfig.json'])
  }, 120000)
})

test('TypeScript 5.7 legacy Node resolution', () => {
  writeFileSync(path.join(consumer, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022', module: 'CommonJS', moduleResolution: 'Node',
      strict: true, noEmit: true, skipLibCheck: false, types: ['node']
    },
    files: ['consumer.ts', 'commonjs.cts']
  }))
  run(process.execPath, [compilerPath('typescript-5'), '-p', 'tsconfig.json'])
}, 120000)
