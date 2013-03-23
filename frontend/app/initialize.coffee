@Luminosity ?= {}
Luminosity.Routers ?= {}
Luminosity.Views ?= {}
Luminosity.Models ?= {}
Luminosity.Collections ?= {}

$ ->

  # Initialize App
  Luminosity.Views.AppView = new AppView = require 'views/app_view'

  # Initialize Backbone History
  Backbone.history.start pushState: yes
