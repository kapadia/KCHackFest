View = require '../lib/view'

module.exports = class CuriosityView extends View
  template: require 'views/templates/curiosity'
  className: 'curiosity'
  el: 'body.application'
  render: =>
    @html @template
    @
