var ss = [], 
	sun, 
	planets = [], 
	orbits = [], 
	ssScale,
	scaling = true,
	prevTime = 0;

var solarSystemScale = function(){
	this.s = .000001;	
	this.sunScale = .00001;
	this.planetScale = .001;
	return this;
} 				

function findSemiMinor(){
	for( var i = 1; i < ephemeris.length; i++ ){
		ephemeris[i].semiMinor = ephemeris[i].A * Math.sqrt( 1 - ephemeris[i].EC * ephemeris[i].EC );
	}
}

function planetsOrbit( time ){
	if( time > prevTime ){
		for ( var i = 1; i < ss.length; i ++ ) {
	        var planet = ss[i];
			ss[i].orbiting( ephemeris[i], time, ssScale.s );
		}
		prevTime = time;
	}	
}

function setSolarSystemScale(){
	if ( scaling ){
		var sunS = 1392684 * ssScale.sunScale;
		// ss[0].scale.set( sunS, sunS, sunS );

		for ( var i = 1; i < ss.length; i ++ ) {
			var planetS = ephemeris[i].size * ssScale.planetScale;
			ss[i].scale.set( planetS, planetS, planetS );
			// ss[i].orbit.scale.set( ssScale.s, ssScale.s, ssScale.s );
	    }

	scaling = false;

	}
}

function makeSolarSystem(){

	findSemiMinor();
	ssScale = new solarSystemScale( { s: 10, sunScale: 10, planetScale: .001 } );

	var ss3D = new THREE.Object3D();

	sun = new Sun();
	ss.push( sun );
	ss3D.add( ss[0] );

	ss[0].label = new Label( ss[0], 1, container );

	for ( var i = 1; i < ephemeris.length; i ++ ) {

		var planetMaterial = new THREE.MeshLambertMaterial( { 
				map: THREE.ImageUtils.loadTexture( ephemeris[i].texture ), 
				overdraw: true 
		});

		var axisMaterial = new THREE.LineBasicMaterial( { 
			color: 0x202020, 
			opacity: .5, 
			linewidth: .5 
		});
		
		ss.push( new Planet( planetMaterial, i ) );
		// ss[i].setOrbit( ephemeris[i] );
		ss[i].name = ephemeris[i].name;
		ss3D.add( ss[i] );

		// ss[i].orbit = new Orbit( ephemeris[i], axisMaterial );
		// ss[i].orbit.name = ss[i].name + " Orbit";
		// ss3D.add( ss[i].orbit );

		ss[i].label = new Label( ss[i], 1, container );

	}

	planetsOrbit(2456365);
	// setSolarSystemScale();
	return ss3D;
};