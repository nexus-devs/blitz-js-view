const fs = require('fs')

/**
 * Endpoint controller which implicitly uses the default endpoint for all
 * requests if no explicit endpoint is given. They would all just call
 * `this.render(req)` anyway, so this abstraction saves a lot of time.
 */
class EndpointController {
  /**
   * Override original endpoint controller with custom loading functions to
   * automatically generate fitting endpoint when none is provided
   */
  override (controller) {
    controller.generateEndpointSchema = this.overrideEndpointSchema(controller)
    controller.getViewTree = this.overrideEndpointTree(controller)
  }

  /**
   * Get endpoint schema from src/pages folder instead of endpoint folder
   */
  overrideEndpointSchema (controller) {
    const override = function () {
      this.endpoints = []
      this.getEndpointTree(this.config.endpointPath)
      this.getViewTree(`${cubic.config.ui.sitesPath}`)
    }
    return override.bind(controller)
  }

  /**
   * Change which file types are detected and change endpoint attributes
   */
  overrideEndpointTree (controller) {
    const override = function (filepath) {
      let stats = fs.lstatSync(filepath)

      // Folder
      if (stats.isDirectory()) {
        fs.readdirSync(filepath).map(child => {
          return this.getViewTree(filepath + '/' + child)
        })
      }

      // File -> Set endpoint config
      else {
        let Endpoint = cubic.nodes.ui.core.Endpoint
        let endpoint = new Endpoint().schema
        let sitesSubDir = cubic.config.ui.sitesPath.replace(cubic.config.ui.sourcePath, '')
        endpoint.view = filepath.replace(`${cubic.config.ui.sourcePath}`, '')
        endpoint.route = endpoint.view.replace(sitesSubDir, '').replace('.vue', '').replace('index', '')
        endpoint.file = cubic.config.ui.core.endpointParent

        // Only add to list of endpoints if no explicit endpoint with same
        // route already exists
        if (!this.endpoints.find(e => e.route === endpoint.route)) {
          this.endpoints.push(endpoint)
        }
      }
    }
    return override.bind(controller)
  }

  /**
   * Quick method starting a rebuild of existing endpoints
   */
  rebuild (controller) {
    return controller.generateEndpointSchema()
  }
}

module.exports = new EndpointController()
