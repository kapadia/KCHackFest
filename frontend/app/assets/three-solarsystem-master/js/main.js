var WIDTH = $(window).width(),
    HEIGHT = $(window).height();

var VIEW_ANGLE = 45,
	ASPECT = WIDTH / HEIGHT,
	NEAR = 1,
	FAR = 100000;

var stats, 
	scene,
	camera,
	renderer, 
	projector,
	composer, 
	controls,
	tween,
	camTarget,
	solarSystem;

var trajectory;

var time, t;
var clock = new THREE.Clock();

var mouse = { x: -1000, y: 0 }, 
	INTERSECTED;

var dae;
var loader = new THREE.ColladaLoader();


/********************************
	PAGE LOADING
********************************/

function setLoadMessage( msg ){
	$( '#loadtext' ).html(msg + "...");
}

$(document).ready( function() {

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	$( '#loadtext' ).show();
	setLoadMessage("Loading the Solar System");

	loader.options.convertUpAxis = true;
	loader.load( './models/galaxy.dae', function ( collada ) {

		dae = collada.scene;
		dae.scale.x = dae.scale.y = dae.scale.z = 60000;
		dae.updateMatrix();

	} );

	loadShaders( shaderList, function (e) {
		shaderList = e;
		postShadersLoaded();
	});

	var postShadersLoaded = function () {
	        init();
	        animate();
			$("#loadtext").hide();
    };
} );

function init() {

	/********************************
		SCENE SETUP
	********************************/
	$container = $("#container");

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.000055 );

	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	camera.position.y = 200;
	camera.position.z = 500;

	camTarget = new THREE.Vector3();
	camTarget = scene.position;

	fovValue = 0.5 / Math.tan(camera.fov * Math.PI / 360) * HEIGHT;
	
	var ambientLight = new THREE.AmbientLight( 0x404040 );
	ambientLight.color.setRGB( .15, .15, .15 );
	scene.add(ambientLight);

	var pointLight = new THREE.PointLight(0xFFFFFF, 1.3);

	pointLight.position.x = 0;
	pointLight.position.y = 0;
	pointLight.position.z = 0;

	scene.add(pointLight);

	/********************************
		RENDERER
	********************************/
	projector = new THREE.Projector();

	renderer = Detector.webgl? new THREE.WebGLRenderer( { antialias: true } ): new THREE.CanvasRenderer();
	renderer.setSize( WIDTH, HEIGHT );

	$container.append( renderer.domElement );
	renderer.autoClear = false;

	controls = new THREE.OrbitControls( camera, $container[0] );
	//controls.addEventListener( 'change', fooBar );

	setupScene();


  /*
   * Web socket code 
   */
  if ('WebSocket' in window) {
    conn = new WebSocket('ws://10.18.14.2:8888/socks');
    conn.onmessage = function(e) {
      var data = String(e.data);
      if (data.search("left") != -1) {
        controls.rotateLeft( data.split(":")[1], true );
      } else if (data.search("up") != -1) {
        controls.rotateUp( data.split(":")[1], true );
      } else if (data.search("zoomIn") != -1) {
        controls.zoomIn( data.split(":")[1], true );
      } else if (data.search("zoomOut") != -1) {
        controls.zoomOut( data.split(":")[1], true );
      } else if (data.search("enablePointerLock") != -1) {
        PointerLock.enableLock();
      } else if (data.search("disablePointerLock") != -1) {
        PointerLock.disableLock();
      } else if (data.search("{") != -1) {
        data = JSON.parse(e.data);
        camX = new camPosition( data['position'], data['target'], data['time'], true );
        camX.tween();
      } else {
        console.log(data);
      }
    }

    //conn.onopen = function(){
    //  console.log('Connection opened!');
    //}

    //conn.onclose = function(){
    //  console.log('Connection closed!');
    //}
  } else {
      console.log("websocket don't work!!");
  }
  /*
   * Web socket code
   */ 


	camOne = new camPosition( { x: 0, y: 50, z: 500 }, { x: 0, y: 0, z: 0 }, 1500, false );
	camTwo = new camPosition( { x: 0, y: 12000, z: 500 }, { x: 0, y: 0, z: 0 }, 5000, false );
	camThree = new camPosition( { x: -500, y: 250, z: -1000 }, { x: 0, y: 0, z: 0 }, 3000, false );
	camEarth = new camPosition( { x: 50, y: 50, z: 250 }, ss[3].position, 1500, false );
	camMars = new camPosition( { x: 75, y: 50, z: 300 }, ss[4].position, 1500, false );

	t = new timer();
	t.count = 2456365;

	buildGUI();

	/********************************
		STATS
	********************************/

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	$container.append( stats.domElement );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

	window.addEventListener( 'resize', onWindowResize, false );

}

function buildGUI(){

	var gui = new dat.GUI();
	gui.add( t, 'multiplier', 0, 5).name( 'Orbit Speed' );

	gui.add(ssScale, 's', 1, 100 )
		.name('SS Scale')
		.onChange( function(){
			scaling = true;
		});
	gui.add(ssScale, 'sunScale', .00001, .00002 )
		.name('Sun Scale')
		.onChange( function(){
			scaling = true;
		});
	gui.add(ssScale, 'planetScale', .0001, .001 )
		.name('Planet Scale')
		.onChange( function(){
			scaling = true;
		});

	var camFolder = gui.addFolder( 'Camera Positions' );
	camFolder.open();
	camFolder.add( camOne, 'tween' ).name( 'Camera Home' );
	camFolder.add( camTwo, 'tween' ).name( 'Camera Two' );
	camFolder.add( camThree, 'tween' ).name( 'Camera Three' );
	camFolder.add( camEarth, 'tween' ).name( 'Camera Earth' );
	camFolder.add( camMars, 'tween' ).name( 'Camera Mars' );

	PointerLock.addEventListener('enabled', function() {
		gui.closed = true;
	});

	PointerLock.addEventListener('disabled', function() {
		gui.closed = false;
	});
}


function setupScene(){

	trajectory = new Trajectory ( 2 );
	solarSystem = makeSolarSystem();
	starField = new stars( 40000, 100 );
	solarSystem.add( starField );

	lensFlares = new THREE.Object3D();
	var override = THREE.ImageUtils.loadTexture( "./images/lensflare/hexangle.png" );
	var sunFlare = addLensFlare( 0, 0, 10, 5, override );
	lensFlares.add( sunFlare );

	var ruler = new Ruler( ss[3], ss[4] );
	// scene.add( ruler );
	
	scene.add( solarSystem );
	// scene.add( lensFlares );
}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onWindowResize() {

	windowHalfX = $(window).width() / 2;
	windowHalfY = $(window).height() / 2;

	uniforms.resolution.value.x = window.innerWidth;
	uniforms.resolution.value.y = window.innerHeight;

	camera.aspect = $(window).width() / $(window).height();
	camera.updateProjectionMatrix();

	renderer.setSize( $(window).width(), $(window).height() );

}

function animate() {

	var delta = clock.getDelta();
	var time = clock.getElapsedTime();
	var currentTime = new Date();

	requestAnimationFrame( animate );

  camera.updateProjectionMatrix();
	camera.lookAt( camTarget );

	updateRulers();
    updateLabels();
	controls.update();
	stats.update();
	TWEEN.update();
	setSolarSystemScale();
	planetsOrbit( currentTime );

	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera );

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects( solarSystem.children );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {
			
			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.label.show();
			// setLoadMessage('Awesome information about ' + INTERSECTED.name + ' could go here!');
			// $( '#loadtext' ).fadeIn('fast');

		}

	} else {

		if ( INTERSECTED != null){
			showLabels( ss, false );
		}

		INTERSECTED = null;
		//  $( '#loadtext' ).fadeOut('fast');

	}	

	uniforms.time.value = time + delta;
	t.count = t.count + 1 * t.multiplier;

	camera.lookAt( camTarget );
	render();
}

function render() {

	renderer.clear();
	renderer.render( scene, camera );

}
