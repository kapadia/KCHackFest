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
        'javascripts/vendor.js': /^vendor\/scripts\/(?!(solar_system|astro))/
        'javascripts/solar_system.js': /^vendor\/scripts\/solar_system/
        'javascripts/astro_data.js': /^vendor\/scripts\/astro/
      order:
        # Files in `vendor` directories are compiled before other files
        # even if they aren't specified in order.
        before: [
          'vendor/scripts/common/jquery.js'
          'vendor/scripts/common/lodash.js'
          'vendor/scripts/common/backbone.js'
          ]
        after: [
          'vendor/scripts/solar_system/solar_system.js'
          ]

    stylesheets:
      joinTo:
        'stylesheets/solar_system.css': /solar_system/
        'stylesheets/app.css': /application/
      order:
        before: ['vendor/styles/normalize.css']
        after: ['vendor/styles/helpers.css']

    templates:
      joinTo: 'javascripts/app.js'
