View = require '../lib/view'

module.exports = class SolarSystemView extends View
  template: require 'views/templates/solar_system'
  className: 'solar_system'
  el: 'body.application'

  render: =>
    @html @template
    @socket = @initSocket()
    setTimeout((=>@socket.send 'can-i-pilot', {}, true), 500)
    @

  updateTexture: (planet_name, texture_name) ->
    for planet in ss
      if planet.name is planet_name
        planetMaterial = new THREE.MeshLambertMaterial {
          map: THREE.ImageUtils.loadTexture(texture_name),
          overdraw: true
        }
        planet.material = planetMaterial
        return planet

  initSocket: =>
    conn = new CSLESocket('solar_system', "ws://#{window.location.hostname}:8898")

    textures = {}
    for planet in ephemeris
      textures[planet.name] = {}
      textures[planet.name].updates = 0
      textures[planet.name].texture = planet.texture

    conn.on('move-camera', (data) ->
      TWEEN.removeAll();
      delay = data.delay || 0
      camTweener(data.position, data.target, delay)
      window.t = data.time)

    conn.on('change-texture', (data) =>
      planet = @updateTexture(data.planet, data.texture)
      textures[planet.name].updates++)

    conn.on('texture-broadcast', (data) =>
      for name,planet of data
        if planet.updates > textures[name].updates
          @updateTexture(name, planet.texture)
          textures[name] = planet)

    conn.on('multiplier-change', (data) ->
      window.t.multiplier = data.val
      window.gui.mult.object.multiplier = data.val
      window.gui.mult.updateDisplay())

    conn.on('ssScale-change', (data) ->
      window.ssScale[data.property] = data.val
      window.scaling = true
      for s in window.gui.scales
        s.object[data.property] = data.val
        s.updateDisplay())

    conn.on 'pilot-changed', (pilot_disabled) ->
      document.getElementById('pilot')?.disabled = pilot_disabled

    setInterval((() ->
      conn.send('texture-broadcast', textures)), 500)

    window.texture_updates = textures
    return window.conn = conn
