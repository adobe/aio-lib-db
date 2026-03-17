/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { isProdWorkspace } = require('../../utils/runtimeNamespace')

describe('Runtime Namespace Utils Tests', () => {
  test.each([
    { namespace: '123456-test1Project', expected: 'passes' },
    { namespace: 'development-123456-test2Project', expected: 'passes' },
    { namespace: '123456-test3Project-stage', expected: 'fails' },
    { namespace: 'development-123456-test4Project-stage', expected: 'fails' },
    { namespace: 'dev-123456-test5Project', expected: 'fails' },
    { namespace: 'test6Project', expected: 'fails' },
    { namespace: '123456a-test7Project', expected: 'fails' },
    { namespace: '123456-test@Project', expected: 'fails' }
  ])('isProdWorkspace() $expected when runtime namespace is $namespace', ({ namespace, expected }) => {
    expect(isProdWorkspace(namespace)).toBe(expected === 'passes')
  })
})
