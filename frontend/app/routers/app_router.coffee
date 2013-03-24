
module.exports = class AppRouter extends Backbone.Router
  routes:
    ''             : 'index'
    'solar-system' : 'solarSystemDemo'
    'astro-data'   : 'astroDataDemo'
    'curiosity'    : 'curiosityDemo'


  index: =>
    CSLE.Views.AppView.homeView.render()

  solarSystemDemo: =>
    CSLE.Views.AppView.socket.close()
    CSLE.Views.AppView.solarSystem.render()

  astroDataDemo: =>
    CSLE.Views.AppView.socket.close()
    CSLE.Views.AppView.astroData.render()

  curiosityDemo: =>
    CSLE.Views.AppView.socket.close()
    console.log 'curiosityDemo'
