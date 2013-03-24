View = require '../lib/view'

module.exports = class CuriosityView extends View
  template: require 'views/templates/curiosity'
  className: 'curiosity'
  el: 'body.application'
  render: =>
    @html @template
    @socket = @initSocket()
    setTimeout((=>@socket.send 'can-i-pilot', {}, true), 500)
    @
  initSocket: ->
    conn = new CSLESocket('curiosity', 'ws://' + window.location.hostname + ':8898')
    conn.on('keydown', window.onKeyDown)
    conn.on('keyup', window.onKeyUp)
    conn.on 'preset-camera-select', (data) ->
      cam = new window.CAMTWEEN( data.position, data.target, data.time, true )
      cam.tween()
    conn.on 'mast-change', (data) ->
      part = if data.subpart == 'main' then rover.mast else rover.mast[data.subpart]
      part.rotation[data.property] = data.val
      displays.mast[data.subpart].object[data.property] = data.val
      displays.mast[data.subpart].updateDisplay()
    conn.on 'camera-rotate', (data) ->
      window.roverGlobals.state = STATE.ROTATE
      roverGlobals.rotateStart.set(data.x, data.y)
    conn.on 'camera-zoom', (data) ->
      window.roverGlobals.state = STATE.ZOOM
      zoomStart.set(data.x, data.y)
    conn.on 'mouse-move', (data) ->
      handleMouseMove(data.x, data.y)
    conn.on 'arm-change', (data) ->
      part = if data.subpart == 'main' then rover.arm else rover.arm[data.subpart]
      part.rotation[data.property] = data.val
      displays.arm[data.subpart].object[data.property] = data.val
      displays.arm[data.subpart].updateDisplay()
    conn.on 'start-dance', (name) ->
      window.dances[name](true, 'start')
    conn.on 'stop-dance', (name) ->
      window.dances[name](true, 'stop')
    conn.on 'pilot-changed', (pilot_disabled) ->
      document.getElementById('pilot')?.disabled = pilot_disabled
    window.conn = conn
