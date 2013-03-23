var Planet = function( material, i ){

	var LOD,
		LODLevel = 3,
		LODDistance = 3000,
		eph = ephemeris[i];

	var P = planet_init_list[i];

	sphereGeo = new THREE.SphereGeometry( 1, 15, 15 );
	LOD = new THREE.Mesh ( sphereGeo, material );
	LOD.startTime = 0;

	// LOD.setOrbit = function( e ){
	// 	eph = e;
	// 	this.startTime = Math.random() * eph.A;
	// 	this.orbiting( this.startTime, eph.period, .00001 );
	// };

	LOD.orbiting = function( JD, scale ){

		var DEGS = 180/Math.PI;      // convert radians to degrees
		var RADS = Math.PI/180;      // convert degrees to radians
		var EPS  = 1.0e-12;          // machine error constant
		var cy = ( JD - 2451545 ) / 36525;         // centuries since J2000
		
		// console.log(cy);
		var a = eph.a[0] + ( eph.a[1] * cy );
		var ep = eph.e[0] + ( eph.e[1] * cy );
		var ip = ( eph.I[0] + ( eph.I[1] * cy / 3600 ) ) * RADS;
		var op = ( P.O_ecliptic_long + ( P.O_per_cy * cy / 3600 ) ) * RADS;
		var wp = ( P.w_perihelion + ( P.w_per_cy * cy / 3600 ) ) * RADS;
		var lp = mod2pi( ( eph.L[0] + ( eph.L[1] * cy / 3600 ) ) * RADS );		

		// position of planet in its orbit
		var mp = mod2pi(lp - wp);
		var vp = true_anomaly(mp, ep);  //TODO: if ep >1, then error
		var rp = a * ( 1 - ep * ep ) / ( 1 + ep * Math.cos( vp ) );
		
		// heliocentric rectangular coordinates of planet
		var dx = rp*(Math.cos(op)*Math.cos(vp + wp - op) - Math.sin(op)*Math.sin(vp + wp - op)*Math.cos(ip));
		var dz = rp*(Math.sin(op)*Math.cos(vp + wp - op) + Math.cos(op)*Math.sin(vp + wp - op)*Math.cos(ip));
		var dy = rp*(Math.sin(vp + wp - op)*Math.sin(ip));

		this.position.x = ssScale.s * dx;
		this.position.y = ssScale.s * dy;
		this.position.z = ssScale.s * dz;

	};

	return LOD;

};

function meanElements( e, JD ){
	var t = JD - 2451545.0 / 36525;
	var eph = new Object();
	eph.e = e.e[0] + e.e[1] * t;
	eph.a = ( e.a[0] + e.a[1] * t );
	eph.I = e.I[0] + e.I[1] * t;
	eph.L = e.L[0] + e.L[1] * t;
	eph.wBar = e.wBar[0] + e.wBar[1] * t;
	eph.om = e.om[0] + e.om[1] * t;

	return eph;
}

function mod2pi( x ) {
	// return an angle in the range 0 to 2pi or 360
	b = x / ( 2 * Math.PI );
	a = ( 2 * Math.PI ) * ( b - abs_floor( b ) );
	if ( a < 0 ) a = ( 2 * Math.PI ) + a;
	return a; 
}

function abs_floor(x) {
	// return the integer part of a number
	return (x >= 0) ? Math.floor(x) : Math.ceil(x);
}

function true_anomaly( mp, ep) {

	// initial approximation of eccentric anomaly
	var E = mp + ep * Math.sin( mp ) * (1.0 + ep * Math.cos( mp ) );

	// iterate to improve accuracy
	var loop = 0;
	while ( loop < 20 ) { //TODO: Check how many times to loop
		var eone = E;
		E = eone - (eone - ep*Math.sin(eone) - mp) / ( 1 - ep * Math.cos( eone ) );

		if (Math.abs( E - eone) < 0.0000007) break;
		loop++;
	}
	
	// convert eccentric anomaly to true anomaly
	var V = 2 * Math.atan2( Math.sqrt( ( 1 + ep ) / ( 1 - ep ) ) * Math.tan( 0.5 * E ), 1 );

	// modulo 2pi
	if ( V < 0 ) V = V + ( 2 * Math.PI ); 

	return V;
}
