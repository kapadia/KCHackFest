View = require '../lib/view'

module.exports = class AstroDataView extends View
  template: require 'views/templates/astro_data'
  className: 'astro-data'
  el: 'body.application'
  bands: ['g', 'r', 'i']
  arrays: {}
  events:
    'change input[data-type="q"]'     : 'onQ'
    'change input[data-type="alpha"]' : 'onAlpha'
  
  
  initialize: ->
    Handlebars.registerPartial('overlay', require('views/templates/overlay'))
    @on 'get-data', @getData
    
  render: =>
    @html @template
    @trigger 'get-data'
    
    # Cache DOM elements
    @sliders = {}
    for slider in document.getElementsByTagName('input') when slider.type is 'range'
      @sliders[slider.dataset.type] = slider
    
    @xCoord = $('[data-type="x"]')
    @yCoord = $('[data-type="y"]')
    @ra = $('[data-type="ra"]')
    @dec = $('[data-type="dec"]')
    @rChannel = $('[data-type="r"]')
    @gChannel = $('[data-type="g"]')
    @bChannel = $('[data-type="b"]')
    @svg = $('svg.annotation')
    @html @overlay
    
    @
  
  # Get remote data (should only be called once)
  getData: =>
    
    # Initialize WebFITS object
    el = document.querySelector('.astro-data .image')
    @webfits = new astro.WebFITS(el, 600)
    
    # Load remote data
    for band in @bands
      opts =
        band: band
        # filepath: "http://astrojs.s3.amazonaws.com/sample/#{band}-band-normalized.fits"
        filepath: "data/frame-#{band}-006073-4-0063.fits"
      new astro.FITS.File(opts.filepath, @fitsHandler, opts)
  
  fitsHandler: (f, opts) =>
    # Get the reference to data chunk from the file
    dataunit = f.getDataUnit()

    # Use options to pass dataunit to callback
    opts.dataunit = dataunit
    
    # Pick one FITS header for general observation metadata and sky coordinates
    if opts.band is 'i'
      
      # Get header, select a few keys, render to table
      header = f.getHeader()
      table = d3.select(".astro-data .metadata").append('table')
      tbody = table.append('tbody')
      
      data = []
      data.push ['ORIGIN', header.get('ORIGIN')]
      data.push ['TELESCOPE', header.get('TELESCOP')]
      data.push ['RUN', header.get('RUN')]
      data.push ['FRAME', header.get('FRAME')]
      data.push ['CAMCOL', header.get('CAMCOL')]
      data.push ['RERUN', header.get('RERUN')]
      
      rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr")
      
      cells = rows.selectAll("td")
        .data( (d) -> d)
        .enter()
        .append("td")
          .text((d) -> d)
      
      # Get coordinate parameters from header
      wcsParams =
        NAXIS: header.get('NAXIS')
        RADESYS: header.get('RADESYS')
        CTYPE1: header.get('CTYPE1')
        CRPIX1: header.get('CRPIX1')
        CRVAL1: header.get('CRVAL1')
        CUNIT1: header.get('CUNIT1')
        CTYPE2: header.get('CTYPE2')
        CRPIX2: header.get('CRPIX2')
        CRVAL2: header.get('CRVAL2')
        CUNIT2: header.get('CUNIT2')
        CD1_1: header.get('CD1_1')
        CD1_2: header.get('CD1_2')
        CD2_1: header.get('CD2_1')
        CD2_2: header.get('CD2_2')
      @wcs = new WCS.Mapper(wcsParams)
      
      # Cache width for coordinate transformations
      @width = header.get('NAXIS1')
      @height = header.get('NAXIS2')
      
    # Read the data (spawns worker)
    dataunit.getFrameAsync(0, @createVisualization, opts)
  
  createVisualization: (arr, opts) =>
    dataunit = opts.dataunit
    width = dataunit.width
    height = dataunit.height
    extent = dataunit.getExtent(arr)
    band = opts.band
    
    # Store array
    @arrays[band] = arr
    
    @webfits.loadImage(band, arr, width, height)
    
    # Get histogram
    @getHistogram(band, arr, extent[0], extent[1])
    
    # Create color composite when all bands are received
    if @webfits.nImages is 3
      @webfits.setScales(1.0, 1.0, 1.0)
      @webfits.setCalibrations(1.0, 1.0, 1.0)
      @webfits.setAlpha(0.03)
      @webfits.setQ(0.01)
      @webfits.drawColor('i', 'g', 'r')
      @ready = true
      
      # Setup websocket and event callbacks when all three files are loaded
      @socket = new CSLESocket('astro_data', "ws://#{window.location.hostname}:8888")
      @socket_active = true
      
      @socket.on('mouse-move', (data) =>
        # Update the image
        @webfits.xOffset = data.xOffset
        @webfits.yOffset = data.yOffset
        @webfits.draw()
        
        @marker.setAttribute("transform", "translate(#{data.xMarker}, #{data.yMarker})")
        
        # Update the info panel
        @updateInfo(data.x, data.y)
      )
      
      @socket.on('zoom', (data) =>
        @webfits.zoom = data.z
        @webfits.draw()
      )
      
      @socket.on('updateQ', (data) =>
        @webfits.setQ(data.Q)
        @sliders['q'].value = data.Q
      )
      
      @socket.on('updateAlpha', (data) =>
        @webfits.setAlpha(data.alpha)
        @sliders['alpha'].value = data.alpha
      )
      @socket.on('pilot-changed', (pilot_disabled) ->
        document.getElementById('pilot')?.disabled = pilot_disabled
      )
      @socket.set_onclose (e) =>
        @socket_active = false
      
      # Create a nice little SVG circle
      @marker = document.createElementNS('http://www.w3.org/2000/svg', "circle")
      @marker.setAttribute("r", 10)
      @marker.setAttribute("fill-opacity", 0)
      @marker.setAttribute("stroke", '#FAFAFA')
      @marker.setAttribute("stroke-width", 1)
      @marker.setAttribute("transform", "translate(#{0}, #{0})")
      @svg[0].appendChild(@marker)
      
      # Propagate events from svg to webfits canvas
      @svg[0].onmousedown = (e) =>
        @webfits.canvas.onmousedown(e)
      @svg[0].onmouseup = (e) =>
        @webfits.canvas.onmouseup(e)
      @svg[0].onmousemove = (e) =>
        @webfits.canvas.onmousemove(e)
      @svg[0].onmouseout = (e) =>
        @webfits.canvas.onmouseout(e)
      @svg[0].onmouseover = (e) =>
        @webfits.canvas.onmouseover(e)
      @svg[0].addEventListener('mousewheel', @wheelHandler, false)
      @svg[0].addEventListener('DOMMouseScroll', @wheelHandler, false)

      # Setup mouse callbacks for webfits
      callbacks =
        onmousemove: (x, y, opts, e) =>
          # Update the marker position
          @marker.setAttribute("transform", "translate(#{e.offsetX}, #{e.offsetY})")
          
          @updateInfo(x, y)
          
          if @socket_active
            @socket.send 'mouse-move',
              x: x
              y: y
              xOffset: @webfits.xOffset
              yOffset: @webfits.yOffset
              xMarker: e.offsetX
              yMarker: e.offsetY
        onzoom: =>
          if @socket_active
            @socket.send 'zoom',
              z: @webfits.zoom

      @webfits.setupControls(callbacks)
  
  wheelHandler: (e) =>
    @webfits.wheelHandler(e)
  
  updateInfo: (x, y) =>
    sky = @wcs.pixelToCoordinate([x, y])
    
    # Check if mouse in image range
    return if x < 0 or y < 0 or x > @width or y > @height
    
    # Get flux values
    r = @arrays['i'][@width * y + x]?.toFixed(3)
    g = @arrays['r'][@width * y + x]?.toFixed(3)
    b = @arrays['g'][@width * y + x]?.toFixed(3)
    @xCoord.text(x)
    @yCoord.text(y)
    @ra.text(sky.ra.toFixed(6))
    @dec.text(sky.dec.toFixed(6))
    @rChannel.text(r)
    @gChannel.text(b)
    @bChannel.text(g)
  
  onQ: (e) =>
    value = e.currentTarget.value
    @webfits.setQ(value)
    @socket.send 'updateQ', {Q: value} if @socket_active

  onAlpha: (e) =>
    value = e.currentTarget.value
    @webfits.setAlpha(value)
    @socket.send 'updateAlpha', {alpha: value} if @socket_active
  
  getHistogram: (band, arr, min, max) =>
    range = max - min

    sum = 0
    nBins = 3000
    binSize = range / nBins
    length = arr.length

    histogram = new Uint32Array(nBins + 1)
    for value in arr
      sum += value
      index = Math.floor(((value - min) / range) * nBins)
      histogram[index] += 1

    min = Math.min.apply(Math, histogram)
    max = Math.max.apply(Math, histogram)

    @drawHistogram(band, min, max, histogram)

  drawHistogram: (band, min, max, histogram) =>
    margin =
      top: 0
      right: 20
      bottom: 10
      left: 10

    w = 200 - margin.right - margin.left
    h = 100 - margin.top - margin.bottom

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
