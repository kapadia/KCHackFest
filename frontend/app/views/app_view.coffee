View      = require 'lib/view'
AppRouter = require 'routers/app_router'
HomeView = require 'views/home_view'
AstroDataView = require 'views/astro_data'
SolarSystemView = require 'views/solar_system'

module.exports = class AppView extends View
  el: 'body.application'

  initialize: ->
    @socket = new CSLESocket('home', "ws://#{window.location.hostname}:8888")
    @uuid = ((Math.random()*16|0).toString(16) for [0..20]).join ''
    @cursors = {}  # map from id -> DOM image
    @homeView = new HomeView()
    @astroData = new AstroDataView()
    @solarSystem = new SolarSystemView()

    @router = new AppRouter()
    CSLE?.Routers?.AppRouter = @router
    @html require 'views/templates/home'

    @socket.on('cursor', (data) =>
      c = @cursors[data.id]
      c = @new_cursor(data.id) unless c?
      c.style.left = "#{data.x}px"
      c.style.top  = "#{data.y}px"
    )
    document.onmousemove = (e) =>
      @socket.send 'cursor',
        id: @uuid
        x: e.pageX
        y: e.pageY


  new_cursor: (id) ->
    elt = document.createElement 'img'
    elt.src = 'http://i148.photobucket.com/albums/s15/LalaFacie/Pixels/star.gif'
    elt.style.position = 'absolute'
    elt.style.zIndex = 99999
    elt.style.border = 'none'
    elt.style.padding = 0
    elt.style.margin = 0
    document.getElementsByTagName("body")[0].appendChild elt
    @cursors[id] = elt
    return elt
