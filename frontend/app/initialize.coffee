@CSLE ?= {}
CSLE.Routers ?= {}
CSLE.Views ?= {}
CSLE.Models ?= {}
CSLE.Collections ?= {}

$ ->

  # Initialize App
  CSLE.Views.AppView = new AppView = require 'views/app_view'
  
  # Conditionally load shim for HTML5 slider
  if navigator.userAgent.indexOf('Firefox') > 0
    $.getScript('/javascripts/html5slider.js')
  
  # Initialize Backbone History
  Backbone.history.start pushState: no
