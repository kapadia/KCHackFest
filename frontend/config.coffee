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
        'javascripts/vendor.js': /^vendor(\/|\\)scripts(\/|\\)(?!astro)/ 
        'javascripts/astro.js': /^vendor(\/|\\)scripts(\/|\\)astro/
      order:
        # Files in `vendor` directories are compiled before other files
        # even if they aren't specified in order.
        before: [
            'vendor/scripts/jquery.js'
            'vendor/scripts/lodash.js'
            'vendor/scripts/backbone.js'
        ]

    stylesheets:
      joinTo: 'stylesheets/app.css'
      order:
        before: ['vendor/styles/normalize.css']
        after: ['vendor/styles/helpers.css']

    templates:
      joinTo: 'javascripts/app.js'
