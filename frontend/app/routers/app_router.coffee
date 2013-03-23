module.exports = class AppRouter extends Backbone.Router
  routes:
    ''             : 'index'
    'solar-system' : 'solarSystemDemo'
    'astro-data'   : 'astroDataDemo'
    'curiosity'    : 'curiosityDemo'


  index: =>
    console.log 'index'

  solarSystemDemo: =>
    console.log 'solarSystemDemo'

  astroDataDemo: =>
    console.log 'astroDataDemo'

  curiosityDemo: =>
    console.log 'curiosityDemo'
