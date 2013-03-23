View      = require 'lib/view'
AppRouter = require 'routers/app_router'
AstroDataView = require 'views/astro_data'

module.exports = class AppView extends View
  el: 'body.application'

  initialize: ->
    @astroData = new AstroDataView()
    
    @router = new AppRouter()
    CSLE?.Routers?.AppRouter = @router
    @html require 'views/templates/home'