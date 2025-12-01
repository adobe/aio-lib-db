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

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const {
  getFilePath,
  readYamlConfig,
  getRuntimeManifestFromAppConfig,
  getRegionFromAppConfig,
  writeRegionToAppConfig
} = require('../../utils/manifestUtils')

// Mock fs, path, and yaml modules
jest.mock('fs')
jest.mock('path')
jest.mock('js-yaml')

describe('manifestUtils tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // mock setup
    path.resolve.mockReturnValue('/test/project')
    path.parse.mockReturnValue({ root: '/' })
    path.dirname.mockReturnValue('/')
  })

  test('getFilePath: should find config file in current directory', () => {
    const expectedPath = '/test/project/app.config.yaml'
    
    path.join.mockReturnValue(expectedPath)
    fs.existsSync.mockImplementation((filePath) => filePath === expectedPath)

    const result = getFilePath('/test/project', 'app.config.yaml')
    
    expect(result).toBe(expectedPath)
  })

  test('getFilePath: should traverses only one directory up', () => {
    const nestedPath = '/test/project/nested/app.config.yaml'
    const parentPath = '/test/project/app.config.yaml'
    
    path.resolve.mockReturnValue('/test/project/nested')
    path.join.mockReturnValueOnce(nestedPath).mockReturnValueOnce(parentPath)
    path.dirname.mockReturnValue('/test/project')
    fs.existsSync.mockImplementation((filePath) => filePath === parentPath)

    const result = getFilePath('/test/project/nested', 'app.config.yaml')
    
    expect(result).toBe(parentPath)
  })

  test('getFilePath: should return null when file not found', () => {
    fs.existsSync.mockReturnValue(false)

    const result = getFilePath('/test/project', 'app.config.yaml')
    
    expect(result).toBeNull()
  })

  test('getFilePath: should validate input parameters', () => {
    expect(getFilePath(null, 'app.config.yaml')).toBeNull()
    expect(getFilePath('/test', null)).toBeNull()
    expect(getFilePath(123, 'app.config.yaml')).toBeNull()
  })

  test('readYamlConfig: should parse valid YAML file', () => {
    const expectedConfig = { key: 'value', nested: { prop: 'test' } }
    
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('key: value\nnested:\n  prop: test')
    yaml.load.mockReturnValue(expectedConfig)

    const result = readYamlConfig('/test/app.config.yaml')
    
    expect(result).toEqual(expectedConfig)
  })

  test('readYamlConfig: should return empty object when file does not exist', () => {
    fs.existsSync.mockReturnValue(false)

    const result = readYamlConfig('/test/nonexistent.yaml')
    
    expect(result).toEqual({})
    expect(fs.readFileSync).not.toHaveBeenCalled()
  })

  test('readYamlConfig: should propagate YAML parsing errors', () => {
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('invalid: [')
    yaml.load.mockImplementation(() => { throw new Error('YAML parsing error') })

    expect(() => readYamlConfig('/test/app.config.yaml')).toThrow('YAML parsing error')
  })

  test('getRuntimeManifestFromAppConfig extracts runtimeManifest from application config', () => {
    const mockConfig = {
      application: {
        runtimeManifest: {
          database: { region: 'apac' }
        }
      }
    }
    
    path.join.mockReturnValue('/test/project/app.config.yaml')
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('mock-yaml')
    yaml.load.mockReturnValue(mockConfig)

    const result = getRuntimeManifestFromAppConfig('/test/project')
    
    expect(result).toEqual({ database: { region: 'apac' } })
  })

  test('getRuntimeManifestFromAppConfig: should return null when no config found', () => {
    fs.existsSync.mockReturnValue(false)

    const result = getRuntimeManifestFromAppConfig('/test/project')
    
    expect(result).toBeNull()
  })

  test('getRuntimeManifestFromAppConfig: should return null when no runtimeManifest in config', () => {
    path.join.mockReturnValue('/test/project/app.config.yaml')
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('mock-yaml')
    yaml.load.mockReturnValue({ someOtherConfig: 'value' })

    const result = getRuntimeManifestFromAppConfig('/test/project')
    
    expect(result).toBeNull()
  })

  test('getRegionFromAppConfig: should extract region from database config', () => {
    const mockConfig = {
      application: {
        runtimeManifest: {
          database: { region: 'emea' }
        }
      }
    }
    
    path.join.mockReturnValue('/test/project/app.config.yaml')
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('mock-yaml')
    yaml.load.mockReturnValue(mockConfig)

    const result = getRegionFromAppConfig('/test/project')
    
    expect(result).toBe('emea')
  })

  test('getRegionFromAppConfig: should return null when no config found', () => {
    fs.existsSync.mockReturnValue(false)

    const result = getRegionFromAppConfig('/test/project')
    
    expect(result).toBeNull()
  })

  test('getRegionFromAppConfig: should return null when no database config', () => {
    const mockConfig = {
      application: {
        runtimeManifest: { someOtherConfig: 'value' }
      }
    }
    
    path.join.mockReturnValue('/test/project/app.config.yaml')
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('mock-yaml')
    yaml.load.mockReturnValue(mockConfig)

    const result = getRegionFromAppConfig('/test/project')
    
    expect(result).toBeNull()
  })

  test('getRegionFromAppConfig: should return null when no region specified', () => {
    const mockConfig = {
      application: {
        runtimeManifest: {
          database: { someOtherProp: 'value' }
        }
      }
    }
    
    path.join.mockReturnValue('/test/project/app.config.yaml')
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('mock-yaml')
    yaml.load.mockReturnValue(mockConfig)

    const result = getRegionFromAppConfig('/test/project')
    
    expect(result).toBeNull()
  })

  test('getRegionFromAppConfig: should propagate YAML parsing errors', () => {
    path.join.mockReturnValue('/test/project/app.config.yaml')
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('invalid-yaml')
    yaml.load.mockImplementation(() => { throw new Error('YAML parsing error') })

    expect(() => getRegionFromAppConfig('/test/project')).toThrow('YAML parsing error')
  })

  test('getRegionFromAppConfig: should propagate file system errors', () => {
    path.join.mockReturnValue('/test/project/app.config.yaml')
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockImplementation(() => { throw new Error('Permission denied') })

    expect(() => getRegionFromAppConfig('/test/project')).toThrow('Permission denied')
  })

  test('writeRegionToAppConfig: should overwrite different region', () => {
    const configPath = '/test/project/app.config.yaml'
    const existingConfig = {
      application: {
        runtimeManifest: {
          database: {
            region: 'emea',
            'auto-provision': true
          }
        }
      }
    }

    path.join.mockReturnValue(configPath)
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('existing config')
    yaml.load.mockReturnValue(existingConfig)
    yaml.dump.mockReturnValue('updated config')
    fs.writeFileSync.mockImplementation(() => {})

    const result = writeRegionToAppConfig('/test/project', 'amer')

    expect(result).toBe(true)
  })

  test('writeRegionToAppConfig: should update app.config.yaml with provided region', () => {
    const configPath = '/test/project/app.config.yaml'
    const existingConfig = { application: {} }

    path.join.mockReturnValue(configPath)
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('existing config')
    yaml.load.mockReturnValue(existingConfig)
    yaml.dump.mockReturnValue('updated config')
    fs.writeFileSync.mockImplementation(() => {})

    const result = writeRegionToAppConfig('/test/project', 'amer')

    expect(result).toBe(true)
  })

  test('writeRegionToAppConfig: should return false when app.config.yaml not found', () => {
    fs.existsSync.mockReturnValue(false)

    const result = writeRegionToAppConfig('/test/project', 'apac')

    expect(result).toBe(false)
  })

  test('writeRegionToAppConfig: should throw error when reading app.config.yaml fails', () => {
    const configPath = '/test/project/app.config.yaml'

    path.join.mockReturnValue(configPath)
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockImplementation(() => { throw new Error('Permission denied') })

    expect(() => writeRegionToAppConfig('/test/project', 'emea'))
      .toThrow('Failed to read app.config.yaml: Permission denied')
  })

  test('writeRegionToAppConfig: should throw error when writing app.config.yaml fails', () => {
    const configPath = '/test/project/app.config.yaml'
    const existingConfig = { application: {} }

    path.join.mockReturnValue(configPath)
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('existing config')
    yaml.load.mockReturnValue(existingConfig)
    yaml.dump.mockReturnValue('updated config')
    fs.writeFileSync.mockImplementation(() => { throw new Error('Disk full') })

    expect(() => writeRegionToAppConfig('/test/project', 'amer'))
      .toThrow('Failed to write app.config.yaml: Disk full')
  })

  test('writeRegionToAppConfig: should preserve auto-provision false value', () => {
    const configPath = '/test/project/app.config.yaml'
    const existingConfig = {
      application: {
        runtimeManifest: {
          database: {
            'auto-provision': false
          }
        }
      }
    }

    path.join.mockReturnValue(configPath)
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue('existing config')
    yaml.load.mockReturnValue(existingConfig)
    yaml.dump.mockReturnValue('updated config')
    fs.writeFileSync.mockImplementation(() => {})

    const result = writeRegionToAppConfig('/test/project', 'apac')

    expect(result).toBe(true)
  })
})
