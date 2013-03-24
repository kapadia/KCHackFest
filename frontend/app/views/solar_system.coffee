View = require '../lib/view'

module.exports = class SolarSystemView extends View
  template: require 'views/templates/solar_system'
  className: 'solar_system'
  el: 'body.application'

  render: =>
    @html @template
    @socket = @initSocket()
    @

  initSocket: ->
    conn = new CSLESocket('solar_system', "ws://#{window.location.hostname}:8888")

    conn.on('move-camera', (data) ->
      TWEEN.removeAll();
      delay = data.delay || 0
      camTweener(data.position, data.target, delay)
      window.t = data.time)
    conn.on('change-texture', (data) ->
      for planet in ss
        if planet.name is data['planet']
          console.log('Changed ' + planet.name + ' texture to ' + data['texture'])
          planetMaterial = new THREE.MeshLambertMaterial {
              map: THREE.ImageUtils.loadTexture(data['texture']),
              overdraw: true
          }
          planet.material = planetMaterial)
    conn.on('multiplier-change', (data) ->
      window.gui.mult.object['multiplier'] = data.val
      window.gui.mult.updateDisplay())
    conn.on('ssScale-change', (data) ->
      window.ssScale[data.property] = data.val
      window.scaling = true
      for s in window.gui.scales
        s.object[data.property] = data.val
        s.updateDisplay())
    conn.on 'pilot-changed', (pilot_disabled) ->
      document.getElementById('pilot')?.disabled = pilot_disabled

    return window.conn = conn
