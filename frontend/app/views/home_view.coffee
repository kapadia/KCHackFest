View = require '../lib/view'

module.exports = class HomeView extends View
  template: require 'views/templates/home'
  className: 'home'
  el: 'body.application'