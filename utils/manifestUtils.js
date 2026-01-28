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
 * @returns {{ path: string|null, files: string[]}} Absolute path to file or null if not found
 */
function getFilePath(startDir, filename) {
  if (!startDir || typeof startDir !== 'string') return { path: null, files: [] }
  if (!filename || typeof filename !== 'string') return { path: null, files: [] }

  let dir = path.resolve(startDir)
  const root = path.parse(dir).root
  const files = []
  while (true) {
    const manifestPath = path.join(dir, filename)
    try {
      const filesInDir = fs.readdirSync(dir) || []
      files.push(...filesInDir.map(fileName => path.join(dir, fileName)))
    }
    catch (e) {
      files.push(`<error reading directory: ${dir}>`)
    }
    if (fs.existsSync(manifestPath)) return { path: manifestPath, files }
    if (dir === root) break
    dir = path.dirname(dir)
  }
  return { path: null, files }
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
 * @returns {{ runtimeManifest: Object|null, files: string[]}} Runtime manifest object or null if not found
 */
function getRuntimeManifestFromAppConfig(startDir) {
  const APP_CONFIG_FILE = 'app.config.yaml'
  const { path: appConfigPath, files } = getFilePath(startDir, APP_CONFIG_FILE)
  if (!appConfigPath) return { runtimeManifest: null, files }
  const parsed = readYamlConfig(appConfigPath)

  // Return runtimeManifest from application.runtimeManifest
  return { runtimeManifest: parsed?.application?.runtimeManifest || null, files }
}

/**
 * Extract region from app config manifest
 *
 * @param {string} startDir - Starting directory to search from
 * @returns {{ region: string|null, files: string[]}} Region string or null if not found
 */
function getRegionFromAppConfig(startDir) {
  const { runtimeManifest, files } = getRuntimeManifestFromAppConfig(startDir)
  return { region: runtimeManifest?.database?.region || null, files }
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
  const { path: appConfigPath } = getFilePath(startDir, APP_CONFIG_FILE)

  // Return false if no app.config.yaml exists
  if (!appConfigPath) {
    return false
  }

  // Read existing config
  const existingConfig = readYamlConfig(appConfigPath)

  // Get current auto-provision value from runtimeManifest.database
  const currentAutoProv = existingConfig?.application?.runtimeManifest?.database?.['auto-provision']

  // Determine auto-provision value:
  // - If true, keep it true
  // - If false or not present, set to false
  const autoProvision = currentAutoProv === true ? true : false

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

  // Write updated config back to file
  const yamlContent = yaml.dump(config, {
    defaultFlowStyle: false,
    lineWidth: -1
  })

  fs.writeFileSync(appConfigPath, yamlContent, 'utf8')
  return true

}

module.exports = {
  getFilePath,
  readYamlConfig,
  getRuntimeManifestFromAppConfig,
  getRegionFromAppConfig,
  writeRegionToAppConfig
}
