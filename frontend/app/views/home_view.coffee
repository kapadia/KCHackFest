View = require '../lib/view'

module.exports = class HomeView extends View
  template: require 'views/templates/home'
  className: 'home'
  el: 'body.application'

  render: ->
    @html require 'views/templates/home'
    @socket = new CSLESocket('home', "ws://#{window.location.hostname}:8888")
    @cursors = {}  # map from id -> DOM image
    @socket.on('cursor', (data) =>
      c = @cursors[data.uuid]
      c = @new_cursor(data.uuid) unless c?
      c.style.left = "#{data.x * document.width}px"
      c.style.top  = "#{data.y * document.height}px"
    )
    @socket.on('goodbye', (data) =>
      c = @cursors[data.uuid]
      c.parentNode.removeChild(c)
      delete @cursors[data.uuid]
    )
    @socket.set_onclose (e) ->
      # reset the mousemove handler
      document.onmousemove = (->)
    document.onmousemove = (e) =>
      @socket.send 'cursor',
        uuid: CSLE.Views.AppView.uuid
        x: e.pageX / document.width
        y: e.pageY / document.height

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
