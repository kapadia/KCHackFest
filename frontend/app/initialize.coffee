@CSLE ?= {}
CSLE.Routers ?= {}
CSLE.Views ?= {}
CSLE.Models ?= {}
CSLE.Collections ?= {}

$ ->

  # Initialize App
  CSLE.Views.AppView = new AppView = require 'views/app_view'

  # Initialize Backbone History
  Backbone.history.start pushState: yes
