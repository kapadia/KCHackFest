
module.exports = class AppRouter extends Backbone.Router
  routes:
    ''             : 'index'
    'solar-system' : 'solarSystemDemo'
    'astro-data'   : 'astroDataDemo'
    'curiosity'    : 'curiosityDemo'


  index: =>
    CSLE.Views.AppView.astroData.socket?.close()
    CSLE.Views.AppView.homeView.render()

  solarSystemDemo: =>
    CSLE.Views.AppView.homeView.socket?.close()
    CSLE.Views.AppView.astroData.socket?.close()
    CSLE.Views.AppView.solarSystem.render()

  astroDataDemo: =>
    CSLE.Views.AppView.homeView.socket?.close()
    CSLE.Views.AppView.astroData.render()

  curiosityDemo: =>
    CSLE.Views.AppView.homeView.socket?.close()
    CSLE.Views.AppView.astroData.socket?.close()
    console.log 'curiosityDemo'
