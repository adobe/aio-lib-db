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

module.exports = {
  getFilePath,
  readYamlConfig,
  getRuntimeManifestFromAppConfig,
  getRegionFromAppConfig
}
