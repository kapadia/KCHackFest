View = require '../lib/view'

module.exports = class AstroDataView extends View
  template: require 'views/templates/astro_data'
  className: 'astro_data'
  el: 'body.application'
  bands: ['g', 'r', 'i']
  
  events:
    'change input[data-type="q"]'     : 'onQ'
    'change input[data-type="alpha"]' : 'onAlpha'
  
  
  initialize: ->
    Handlebars.registerPartial('overlay', require('views/templates/overlay'))
    @once 'get-data', @getData
    
  render: =>
    @html @template
    @trigger 'get-data'
    @html @overlay
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
        filename: "frame-#{band}-006073-4-0063.fits"
      new astro.FITS.File("data/frame-#{band}-006073-4-0063.fits", @fitsHandler, opts)
  
  fitsHandler: (f, opts) =>
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
    
    # Get histogram
    @getHistogram(band, arr, extent[0], extent[1])

    # Create color composite when all bands are received
    if @webfits.nImages is 3
      @webfits.setScales(1.0, 1.0, 1.0);
      @webfits.setCalibrations(1.0, 1.0, 1.0);
      @webfits.setAlpha(0.03);
      @webfits.setQ(0.01);
      @webfits.drawColor('i', 'g', 'r');
      
    # setup websocket and event callbacks
    @socket = new CSLESocket('astro_data', "ws://#{window.location.hostname}:8888")
    @socket_active = true
    @socket.on('mouse-move', (data) =>
      @webfits.xOffset = data.x
      @webfits.yOffset = data.y
      @webfits.draw()
    )
    @socket.on('zoom', (data) =>
      @webfits.zoom = data.z
      @webfits.draw()
    )
    @socket.set_onclose (e) => @socket_active = false


    # Setup mouse callbacks for webfits
    callbacks =
      onmousemove: =>
        if @socket_active and @webfits.drag
          @socket.send 'mouse-move',
            x: @webfits.xOffset
            y: @webfits.yOffset
      onzoom: =>
        if @socket_active
          @socket.send 'zoom',
            z: @webfits.zoom

    @webfits.setupControls(callbacks)
    
  onQ: (e) =>
    @webfits.setQ(e.currentTarget.value)

  onAlpha: (e) =>
    @webfits.setAlpha(e.currentTarget.value)
  
  getHistogram: (band, arr, min, max) =>
    range = max - min
    
    sum = 0
    nBins = 300
    binSize = range / nBins
    length = arr.length
    
    histogram = new Uint32Array(nBins + 1)
    for value in arr
      sum += value
      index = Math.floor(((value - min) / range) * nBins)
      histogram[index] += 1
      
    # Apply log to histogram
    for value, index in histogram
      histogram[index] = Math.log(value)
      
    min = Math.min.apply(Math, histogram)
    max = Math.max.apply(Math, histogram)
    
    @drawHistogram(band, min, max, histogram)
  
  drawHistogram: (band, min, max, histogram) =>
    console.log band, min, max, histogram
    margin =
      top: 0
      right: 20
      bottom: 60
      left: 10
    
    w = 390 - margin.right - margin.left
    h = 260 - margin.top - margin.bottom
    
    # Create x and y scales
    x = d3.scale.linear()
      .domain([min, max])
      .range([0, w])
    
    y = d3.scale.linear()
      .domain([0, d3.max(histogram)])
      .range([0, h])
    
    svg = d3.select(".histogram-#{band}").append('svg')
      .attr('width', w + margin.right + margin.left)
      .attr('height', w + margin.top + margin.bottom)
      .append('g')
      .attr('transform', "translate(#{margin.left}, #{margin.top})")
      
    # Create a parent element for the svg
    main = svg.append('g')
      .attr('transform', "translate(#{margin.left}, #{margin.top})")
      .attr('width', w)
      .attr('height', h)
      .attr('class', 'main')
    
    # Add the data
    bars = svg.selectAll('rect')
      .data(histogram)
      .enter().append('rect')
      .attr('x', ((d, i) ->
        return i * 1.25 + margin.left
      ))
      .attr('y', ((d) ->
        return h - y(d) + margin.top - 1.5
      ))
      .attr('width', 1)
      .attr('height', ((d) ->
        return y(d)
      ))
      .attr('class', band)
    
    # Create an x axis
    xAxis = d3.svg.axis()
      .scale(x)
      .ticks(6)
      .orient('bottom')
    
    # Append the x axis to the parent object
    main.append('g')
      .attr('transform', "translate(#{-1 * margin.left}, #{h})")
      .attr('class', 'main axis date')
      .call(xAxis)
    
    # Append the brush
    svg.append('g')
      .attr('class', 'brush')
      .attr('width', w)
      .attr('height', h)
