View      = require 'lib/view'
AppRouter = require 'routers/app_router'
HomeView = require 'views/home_view'
AstroDataView = require 'views/astro_data'
SolarSystemView = require 'views/solar_system'

module.exports = class AppView extends View
  el: 'body.application'

  initialize: ->
    @homeView = new HomeView()
    @astroData = new AstroDataView()
    @solarSystem = new SolarSystemView()

    @router = new AppRouter()
    CSLE?.Routers?.AppRouter = @router
