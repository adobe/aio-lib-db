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


/**
 * Walk upwards from startDir looking for the filename. Returns the absolute
 * path to the first match or null if none found.
 *
 * @param {string} startDir - Starting directory for search
 * @param {string} filename - Filename to search for
 * @returns {string|null} Absolute path to file or null if not found
 */
function getFilePath(startDir, filename) {
  if (!startDir || typeof startDir !== 'string') return null
  if (!filename || typeof filename !== 'string') return null
  
  let dir = path.resolve(startDir)
  const root = path.parse(dir).root
  while (true) {
    const manifestPath = path.join(dir, filename)
    if (fs.existsSync(manifestPath)) return manifestPath
    if (dir === root) break
    dir = path.dirname(dir)
  }
  return null
}

/**
 * Read and parse YAML configuration file
 *
 * @param {string} filePath - Path to YAML file
 * @returns {Object} Parsed YAML content or empty object if file doesn't exist
 */
function readYamlConfig(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const content = fs.readFileSync(filePath, 'utf8')
  return yaml.load(content)
}

/**
 * Read `app.config.yaml` (if present) and return the `runtimeManifest` object
 * or null if not found.
 *
 * @param {string} startDir - Starting directory to search from
 * @returns {Object|null} Runtime manifest object or null if not found
 */
function getRuntimeManifestFromAppConfig(startDir) {
  const APP_CONFIG_FILE = 'app.config.yaml'
  const appConfigPath = getFilePath(startDir, APP_CONFIG_FILE)
  if (!appConfigPath) return null
  const parsed = readYamlConfig(appConfigPath)
  
  // Return runtimeManifest from application.runtimeManifest
  return parsed?.application?.runtimeManifest || null
}

/**
 * Extract region from app config manifest
 *
 * @param {string} startDir - Starting directory to search from
 * @returns {string|null} Region string or null if not found
 */
function getRegionFromAppConfig(startDir) {
  const runtimeManifest = getRuntimeManifestFromAppConfig(startDir)
  return runtimeManifest?.database?.region || null
}

/**
 * Write database configuration to existing app.config.yaml
 *
 * @param {string} startDir - Starting directory to search from
 * @param {string} region - Database region
 * @returns {boolean} True if region was written, false if file not found
 * @throws {Error} If file operations fail (read/write/parse errors)
 */
function writeRegionToAppConfig(startDir, region) {
  const APP_CONFIG_FILE = 'app.config.yaml'
  const appConfigPath = getFilePath(startDir, APP_CONFIG_FILE)

  // Return false if no app.config.yaml exists
  if (!appConfigPath) {
    return false
  }

  let existingConfig
  try {
    // Read existing config
    existingConfig = readYamlConfig(appConfigPath)

    // Check if region already exists and log warning for overwriting
    const existingRegion = existingConfig?.application?.runtimeManifest?.database?.region
    if (existingRegion && existingRegion !== region) {
      console.warn(`Overwriting existing database region '${existingRegion}' with '${region}' in app.config.yaml`)
    }
  } catch (error) {
    throw new Error(`Failed to read app.config.yaml: ${error.message}`)
  }

  // Get current auto-provision value from runtimeManifest.database
  const currentAutoProv = existingConfig?.application?.runtimeManifest?.database?.['auto-provision']

  // Determine auto-provision value:
  // - If false, keep it false
  // - If true or not present, set to true
  const autoProvision = currentAutoProv === false ? false : true

  // Ensure nested structure exists and add region + auto-provision inside runtimeManifest
  const config = {
    ...existingConfig,
    application: {
      ...existingConfig?.application,
      runtimeManifest: {
        ...existingConfig?.application?.runtimeManifest,
        database: {
          ...existingConfig?.application?.runtimeManifest?.database,
          'auto-provision': autoProvision,
          region: region
        }
      }
    }
  }

  try {
    // Write updated config back to file
    const yamlContent = yaml.dump(config, {
      defaultFlowStyle: false,
      lineWidth: -1
    })

    fs.writeFileSync(appConfigPath, yamlContent, 'utf8')
    return true
  } catch (error) {
    throw new Error(`Failed to write app.config.yaml: ${error.message}`)
  }
}

module.exports = {
  getFilePath,
  readYamlConfig,
  getRuntimeManifestFromAppConfig,
  getRegionFromAppConfig,
  writeRegionToAppConfig
}
