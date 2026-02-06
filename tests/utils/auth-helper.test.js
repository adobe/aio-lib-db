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

const { getAccessToken } = require('../../utils/auth-helper')
const { CLI_CONTEXT_NAME } = require('../../lib/constants')
const DbError = require('../../lib/DbError')

// Mock dependencies
jest.mock('@adobe/aio-lib-ims')
jest.mock('@adobe/aio-lib-env')
jest.mock('@adobe/aio-lib-core-logging', () => {
  return jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }))
})

const { Ims, getToken, context } = require('@adobe/aio-lib-ims')
const { getCliEnv } = require('@adobe/aio-lib-env')

describe('auth-helper', () => {
  const mockAccessToken = 'mock-access-token-12345'
  const mockContextName = CLI_CONTEXT_NAME
  const mockEnv = 'prod'

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mocks
    getCliEnv.mockReturnValue(mockEnv)
    context.getCurrent.mockResolvedValue(null)
    context.setCli = jest.fn().mockResolvedValue(undefined)
    context.setCurrent = jest.fn().mockResolvedValue(undefined)
    context.get = jest.fn()
    getToken.mockResolvedValue(mockAccessToken)
    
    // Mock IMS validation
    const mockImsInstance = {
      validateToken: jest.fn().mockResolvedValue({ valid: true })
    }
    Ims.mockImplementation(() => mockImsInstance)
  })

  describe('getAccessToken', () => {
    test('should retrieve token from default cli context', async () => {
      const result = await getAccessToken()

      expect(result).toEqual({ accessToken: mockAccessToken })
      expect(getCliEnv).toHaveBeenCalled()
      expect(context.getCurrent).toHaveBeenCalled()
      expect(getToken).toHaveBeenCalledWith(mockContextName)
    })

    test('should retrieve cached token when useCachedToken is true', async () => {
      const cachedToken = 'cached-token-456'
      context.get.mockResolvedValue({
        data: { access_token: { token: cachedToken } }
      })

      const result = await getAccessToken({ useCachedToken: true })

      expect(result).toEqual({ accessToken: cachedToken })
      expect(context.get).toHaveBeenCalledWith(mockContextName)
      expect(getToken).not.toHaveBeenCalled()
    })

    test('should use non-cli context when set', async () => {
      const customContext = 'mycontext'
      context.getCurrent.mockResolvedValue(customContext)
      
      const result = await getAccessToken()

      expect(result).toEqual({ accessToken: mockAccessToken })
      expect(getToken).toHaveBeenCalledWith(customContext)
    })

    test('should set cli context when no current context', async () => {
      context.getCurrent.mockResolvedValue(null)
      
      await getAccessToken()

      expect(context.setCli).toHaveBeenCalledWith({ 'cli.bare-output': true }, false)
    })

    test('should use setCurrent when setCli is not available', async () => {
      context.getCurrent.mockResolvedValue(null)
      context.setCli = undefined // Simulate older version without setCli
      
      await getAccessToken()

      expect(context.setCurrent).toHaveBeenCalledWith(mockContextName)
    })

    test('should validate token', async () => {
      const mockValidate = jest.fn().mockResolvedValue({ valid: true })
      Ims.mockImplementation(() => ({ validateToken: mockValidate }))

      await getAccessToken()

      expect(Ims).toHaveBeenCalledWith(mockEnv)
      expect(mockValidate).toHaveBeenCalledWith(mockAccessToken)
    })

    test('should fail when context retrieval fails', async () => {
      context.getCurrent.mockRejectedValue(new Error('Context error'))

      await expect(getAccessToken()).rejects.toThrow(DbError)
      await expect(getAccessToken()).rejects.toThrow('Failed to retrieve IMS context')
    })

    test('should fail when token retrieval fails', async () => {
      getToken.mockRejectedValue(new Error('Token error'))

      await expect(getAccessToken()).rejects.toThrow(DbError)
      await expect(getAccessToken()).rejects.toThrow('Failed to retrieve access token from IMS context')
    })

    test('should fail when token is null or undefined', async () => {
      getToken.mockResolvedValue(null)

      await expect(getAccessToken()).rejects.toThrow(DbError)
      await expect(getAccessToken()).rejects.toThrow('is not available')
    })

    test('should fail when token validation fails', async () => {
      const mockValidate = jest.fn().mockResolvedValue({ valid: false })
      Ims.mockImplementation(() => ({ validateToken: mockValidate }))

      await expect(getAccessToken()).rejects.toThrow(DbError)
      await expect(getAccessToken()).rejects.toThrow('Failed to validate IMS access token')
    })

    test('should throw error when validation throws error', async () => {
      const mockValidate = jest.fn().mockRejectedValue(new Error('Validation error'))
      Ims.mockImplementation(() => ({ validateToken: mockValidate }))

      await expect(getAccessToken()).rejects.toThrow(DbError)
      await expect(getAccessToken()).rejects.toThrow('Failed to validate IMS access token')
    })

    test('should wrap non-DbError in DbError', async () => {
      const customError = new Error('Custom error')
      const mockValidate = jest.fn().mockRejectedValue(customError)
      Ims.mockImplementation(() => ({ validateToken: mockValidate }))

      await expect(getAccessToken()).rejects.toThrow(DbError)
      await expect(getAccessToken()).rejects.toThrow('Failed to validate IMS access token')
    })

    test('should create IMS instance for selected envs', async () => {
      const mockValidate = jest.fn().mockResolvedValue({ valid: true })
      Ims.mockImplementation(() => ({ validateToken: mockValidate }))
      
      await getAccessToken()
      
      getCliEnv.mockReturnValue('stage')
      await getAccessToken()

      // Should create separate IMS instances
      expect(Ims).toHaveBeenCalledTimes(2)
      expect(Ims).toHaveBeenNthCalledWith(1, 'prod')
      expect(Ims).toHaveBeenNthCalledWith(2, 'stage')
    })
  })
})
