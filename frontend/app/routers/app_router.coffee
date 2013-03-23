
module.exports = class AppRouter extends Backbone.Router
  routes:
    ''             : 'index'
    'solar-system' : 'solarSystemDemo'
    'astro-data'   : 'astroDataDemo'
    'curiosity'    : 'curiosityDemo'


  index: =>
    console.log 'index'

  solarSystemDemo: =>
    CSLE.Views.AppView.solarSystem.render()

  astroDataDemo: =>
    CSLE.Views.AppView.astroData.render()

  curiosityDemo: =>
    console.log 'curiosityDemo'
