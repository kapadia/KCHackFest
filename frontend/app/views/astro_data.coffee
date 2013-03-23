View = require '../lib/view'

module.exports = class AstroDataView extends View
  template: require 'views/templates/astro_data'
  className: 'astro_data'
  el: 'body.application'
  bands: ['g', 'r', 'i']
  sampleSpectra: 'http://astrojs.s3.amazonaws.com/sample/spec-0406-51869-0012.fits'
  socket: new CSLESocket('astro_data', 'ws://localhost:8888')
  
  events:
    'change input[data-type="q"]'     : 'onQ'
    'change input[data-type="alpha"]' : 'onAlpha'
  
  
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

    # Create color composite when all bands are received
    if @webfits.nImages is 3
      @webfits.setScales(1.0, 1.0, 1.0);
      @webfits.setCalibrations(1.0, 1.0, 1.0);
      @webfits.setAlpha(0.03);
      @webfits.setQ(0.01);
      @webfits.drawColor('i', 'g', 'r');
      
    # setup websocket event callbacks
    @socket.on('mouse-move', (data) ->
      webfits.xOffset = data.x
      webfits.yOffset = data.y
      webfits.draw()
    )
    @socket.on('zoom', (data) ->
      webfits.zoom = data.z
      webfits.draw()
    )

    # Setup mouse callbacks for webfits
    callbacks =
      onmousemove: =>
        if webfits.drag
          @socket.send 'mouse-move',
            x: webfits.xOffset
            y: webfits.yOffset
      onzoom: =>
        @socket.send 'zoom',
          z: webfits.zoom

    @webfits.setupControls(callbacks)
    
  onQ: (e) =>
    @webfits.setQ(e.currentTarget.value)

  onAlpha: (e) =>
    @webfits.setAlpha(e.currentTarget.value)
    
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
