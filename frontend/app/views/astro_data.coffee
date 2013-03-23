View = require '../lib/view'

module.exports = class AstroDataView extends View
  template: require 'views/templates/astro_data'
  className: 'astro_data'
  el: 'body.application'
  bands: ['g', 'r', 'i']
  sampleSpectra: 'http://astrojs.s3.amazonaws.com/sample/spec-0406-51869-0012.fits'
  
  # socket: new CSLESocket('astro_data', 'ws://localhost:8888')
  
  events:
    'change input[data-type="q"]' : 'onQ'
  
  onQ: (e) ->
    console.log 'onQ'
  
  initialize: ->
    @once 'get-data', @getData
    
  render: =>
    @html @template
    @trigger 'get-data'
    @
  
  # Get remote data (should only be called once)
  getData: =>
    
    # Initialize WebFITS object
    el = document.querySelector('.astro_data')
    @webfits = new astro.WebFITS(el, 600)
    
    # Load remote data
    for band in @bands
      opts =
        band: band
      new astro.FITS.File("data/frame-#{band}-006073-4-0063.fits", @getImage, opts)

  getImage: (f, opts) =>
    # Get the reference to data chunk from the file
    dataunit = f.getDataUnit()

    # Use options to pass dataunit to callback
    opts.dataunit = dataunit

    # Read the data (spawns worker)
    dataunit.getFrameAsync(0, @createVisualization, opts)

  createVisualization: (arr, opts) =>
    dataunit = opts.dataunit
    width = dataunit.width
    height = dataunit.height
    extent = dataunit.getExtent(arr)
    band = opts.band
    
    @webfits.loadImage(band, arr, width, height)
    
    # @socket.on('mouse-move', (data) =>
    #   console.log(data)
    #   webfits.xOffset = data.x
    #   webfits.yOffset = data.y)
    
    # Create color composite when all bands are received
    if @webfits.nImages is 3
      @webfits.setScales(1.0, 1.0, 1.0);
      @webfits.setCalibrations(1.0, 1.0, 1.0);
      @webfits.setAlpha(0.03);
      @webfits.setQ(0.01);
      @webfits.drawColor('i', 'g', 'r');
      window.webfits = @webfits
      
      # Setup mouse callbacks for WebFITS
      callbacks =
        onmousedown: ->
          console.log 'onmousedown'
        onmouseup: ->
          console.log 'onmouseup'
        onmousemove: (x, y, opts) ->
          console.log 'onmousemove'
          # @socket.send('mouse-move', {x: x, y: y, opts: opts}))
        onmouseout: ->
          console.log 'onmouseout'
        onmouseover: ->
          console.log 'onmouseover'

      @webfits.setupControls(callbacks)
    
  getSpectra: (f) =>
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
