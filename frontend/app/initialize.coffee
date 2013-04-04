@CSLE ?= {}
CSLE.Routers ?= {}
CSLE.Views ?= {}
CSLE.Models ?= {}
CSLE.Collections ?= {}

# set this to the path to the landing page
# i.e., if the landing page is at http://www.example.com/foo/bar/cizzle/
#  then CIZZLE_WEB_ROOT should be set to '/foo/bar/cizzle/'
CIZZLE_WEB_ROOT = '/'

# set this to the port of the websocket server (backend.py)
CSLE.websocket_port = '8898'

$ ->

  # Initialize App
  CSLE.Views.AppView = new AppView = require 'views/app_view'

  # Conditionally load shim for HTML5 slider
  if navigator.userAgent.indexOf('Firefox') > 0
    $.getScript('/javascripts/html5slider.js')

  # Initialize Backbone History
  Backbone.history.start
    pushState: no
    root: CIZZLE_WEB_ROOT
