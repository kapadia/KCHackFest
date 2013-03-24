View      = require 'lib/view'
AppRouter = require 'routers/app_router'
HomeView = require 'views/home_view'
AstroDataView = require 'views/astro_data'
SolarSystemView = require 'views/solar_system'

module.exports = class AppView extends View
  el: 'body.application'

  initialize: ->
    @uuid = ((Math.random()*16|0).toString(16) for [0..20]).join ''
    @homeView = new HomeView()
    @astroData = new AstroDataView()
    @solarSystem = new SolarSystemView()

    @router = new AppRouter()
    CSLE?.Routers?.AppRouter = @router
    @html require 'views/templates/home'
