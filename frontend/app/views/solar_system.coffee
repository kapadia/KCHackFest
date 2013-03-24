View = require '../lib/view'

module.exports = class SolarSystemView extends View
  template: require 'views/templates/solar_system'
  className: 'solar_system'
  el: 'body.application'

  initialize: =>
    @once 'init-socket', @initSocket

  render: =>
    @html @template
    @trigger 'init-socket'
    @

  initSocket: ->
    conn = new CSLESocket('solar_system', "ws://#{window.location.hostname}:8888")

    conn.on('preset-camera-select', (data) ->
      camX = new camPosition(data.position, data.target, data.time, true)
      camX.tween())

    conn.on('camera-rotate', (data) ->
      window.controls.state = window.controls.STATE.ROTATE
      window.controls.rotateStart.set(data.x, data.y))
    conn.on('camera-zoom', (data) ->
      window.controls.state = window.controls.STATE.ZOOM
      window.controls.zoomStart.set(data.x, data.y))
    conn.on('mouse-wheel', (data) ->
      window.controls.handleMouseWheel(data.delta))
    conn.on('mouse-move', (data) ->
      window.controls.handleMouseMove(data.x, data.y))
    conn.on("delta-mouse-move", (event) ->
      window.controls.rotateByDelta(event.x, event.y))
    conn.on('mouse-up', (data) ->
      window.controls.state = window.controls.STATE.NONE)

    conn.on('multiplier-change', (data) ->
      t['multiplier'] = data.val
      window.gui.mult.object['multiplier'] = data.val
      window.gui.mult.updateDisplay())
    conn.on('ssScale-change', (data) ->
      ssScale[data.property] = data.val
      scaling = true
      for s in window.gui.scales
        s.object[data.property] = data.val
        s.updateDisplay())

    window.conn = conn
