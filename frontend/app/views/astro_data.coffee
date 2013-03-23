View = require '../lib/view'

module.exports = class AstroDataView extends View
  template: require 'views/templates/astro_data'
  className: 'astro_data'
  el: 'body.application'
  sampleImage: 'http://astrojs.s3.amazonaws.com/sample/m101.fits'
  sampleSpectra: 'http://astrojs.s3.amazonaws.com/sample/spec-0406-51869-0012.fits'
  
  initialize: ->
    @once 'get-data', @getData
  
  render: =>
    @html @template
    @trigger 'get-data'
    @
  
  # Get remote data (should only be called once)
  getData: =>
    # Load remote image
    new astro.FITS.File(@sampleImage, @getImage)
    
    # Load remote spectra
    new astro.FITS.File(@sampleSpectra, @getSpectra)
  
  getImage: (f) =>
    console.log 'getImage'
    # Get the reference to data chunk from the file
    dataunit = f.getDataUnit()
    
    # Use options to pass dataunit to callback
    opts = {}
    opts.dataunit = dataunit
    
    # Read the data (spawns worker)
    dataunit.getFrameAsync(0, @createVisualization, opts)
    
  createVisualization: (arr, opts) =>
    console.log arr, opts
    dataunit = opts.dataunit
    width = dataunit.width
    height = dataunit.height
    extent = dataunit.getExtent(arr)
    
    # Initialize visualization context
    el = document.querySelector('.astro_data')
    webfits = new astro.WebFITS(el, 400)
    webfits.setupControls()
    webfits.loadImage('sample', arr, width, height)
    webfits.setExtent(extent[0], extent[1])
    
  getSpectra: (f) =>
    console.log 'getSpectra'
    
    dataunit = f.getDataUnit()
    
    opts = {}
    opts.dataunit = dataunit
    
    # Read the first 10 rows to generate a table
    rows = []
    for i in [0..9]
      rows.push dataunit.getRow()
    
    table = d3.select('.spectra')
      .append('table')
    thead = table.append('thead')
    tbody = table.append('tbody')
    
    # Create the table header
    thead.append('tr')
      .selectAll('th')
      .data(dataunit.columns)
      .enter()
      .append("th")
        .text( (c) -> c)
    
    
    