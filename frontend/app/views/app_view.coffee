View      = require 'lib/view'
AppRouter = require 'routers/app_router'
HomeView = require 'views/home_view'
AstroDataView = require 'views/astro_data'
SolarSystemView = require 'views/solar_system'
CuriosityView = require 'views/curiosity'

module.exports = class AppView extends View
  el: 'body.application'

  initialize: ->
    @uuid = ((Math.random()*16|0).toString(16) for [0..20]).join ''
    @homeView = new HomeView()
    @astroData = new AstroDataView()
    @solarSystem = new SolarSystemView()
    @curiosity = new CuriosityView()

    @router = new AppRouter()
    CSLE?.Routers?.AppRouter = @router
    @html require 'views/templates/home'

window.is_pilot = false
window.pilot_clicked = (taking_control) ->
  window.is_pilot = taking_control
  app_view = CSLE.Views.AppView
  hash_to_view =
    '': app_view.homeView
    '#/astro-data': app_view.astroData
    '#/curiosity': app_view.curiosity
    '#/solar-system': app_view.solarSystem
  view = hash_to_view[window.location.hash]
  if taking_control
    msg = 'take-pilot'
    label = 'RELEASE'
  else
    msg = 'release-pilot'
    label = 'PILOT'
  view?.socket?.send(msg, {}, true)
  document.getElementById('pilot')?.textContent = label
