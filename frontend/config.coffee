exports.config =
  coffeelint:
    pattern: /^app\/.*\.coffee$/
    options:
      indentation:
        value: 2
        level: "warning"

  files:
    javascripts:
      joinTo:
        'javascripts/app.js': /^app/
        'javascripts/vendor.js': /^vendor(\/|\\)scripts(\/|\\)[^_]/
        'javascripts/solar_system.js': /^vendor(\/|\\)scripts(\/|\\)_solar_system/
        'javascripts/astro_data.js': /^vendor(\/|\\)scripts(\/|\\)_astro/
        'javascripts/curiosity.js': /^vendor(\/|\\)scripts(\/|\\)_curiosity/
      order:
        # Files in `vendor` directories are compiled before other files
        # even if they aren't specified in order.
        before: [
          'vendor/scripts/common/jquery.js'
          'vendor/scripts/common/lodash.js'
          'vendor/scripts/common/backbone.js'
          'vendor/scripts/common/three.min.js'
          'vendor/scripts/common/stats.min.js'
          'vendor/scripts/common/dat.gui.min.js'
          'vendor/scripts/common/tween.min.js'
          'vendor/scripts/common/Detector.js'
          ]
        after: [
          'vendor/scripts/solar_system/solar_system.js'
          'vendor/scripts/curiosity.js'
          ]

    stylesheets:
      joinTo:
        'stylesheets/solar_system.css': /solar_system/
        'stylesheets/curiosity.css': /curiosity/
        'stylesheets/app.css': /application|vendor/
      order:
        before: ['vendor/styles/normalize.css']
        after: ['vendor/styles/helpers.css']

    templates:
      joinTo: 'javascripts/app.js'
