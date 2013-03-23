var Planet = function( material, i ){

	var LOD,
		LODLevel = 3,
		LODDistance = 3000,
		eph;
	var P = planet_init_list[i];
	var lastDate = 0;

	sphereGeo = new THREE.SphereGeometry( 1, 15, 15 );
	LOD = new THREE.Mesh ( sphereGeo, material );
	LOD.startTime = 0;

	// LOD.setOrbit = function( e ){
	// 	eph = e;
	// 	this.startTime = Math.random() * eph.A;
	// 	this.orbiting( this.startTime, eph.period, .00001 );
	// };

	LOD.orbiting = function( eph, JD, scale ){

		var DEGS = 180/Math.PI;      // convert radians to degrees
		var RADS = Math.PI/180;      // convert degrees to radians
		var EPS  = 1.0e-12;          // machine error constant
		var cy = (JD - 2451545)/36525;         // centuries since J2000
		
		var ap = P.a_semimajor_axis + (P.a_per_cy*cy);
		var ep = P.e_eccentricity + (P.e_per_cy*cy);
		var ip = (P.i_inclination + (P.i_per_cy*cy/3600))*RADS;
		var op = (P.O_ecliptic_long + (P.O_per_cy*cy/3600))*RADS;
		var wp = (P.w_perihelion + (P.w_per_cy*cy/3600))*RADS;
		var lp = mod2pi((P.L_mean_longitude + (P.L_per_cy*cy/3600))*RADS);		

		// position of planet in its orbit
		var mp = mod2pi(lp - wp);
		var vp = true_anomaly(mp, ep);  //TODO: if ep >1, then error
		var rp = ap*(1 - ep*ep) / (1 + ep*Math.cos(vp));
		
		// heliocentric rectangular coordinates of planet
		var dx = rp*(Math.cos(op)*Math.cos(vp + wp - op) - Math.sin(op)*Math.sin(vp + wp - op)*Math.cos(ip));
		var dz = rp*(Math.sin(op)*Math.cos(vp + wp - op) + Math.cos(op)*Math.sin(vp + wp - op)*Math.cos(ip));
		var dy = rp*(Math.sin(vp + wp - op)*Math.sin(ip));

		this.position.x = 100 * dx;
		this.position.y = 100 * dy;
		this.position.z = 100 * dz;

		var date = JD.Julian2Date();
		if ((P.planetName == "Earth") && (date.getMonth() != lastDate)) {
			console.log(date.toString());
			lastDate = date.getMonth();
		}
	};

	return LOD;

};

Number.prototype.Julian2Date = function() {
	 
    var X = parseFloat(this)+0.5;
    var Z = Math.floor(X); //Get day without time
    var F = X - Z; //Get time
    var Y = Math.floor((Z-1867216.25)/36524.25);
    var A = Z+1+Y-Math.floor(Y/4);
    var B = A+1524;
    var C = Math.floor((B-122.1)/365.25);
    var D = Math.floor(365.25*C);
    var G = Math.floor((B-D)/30.6001);
    //must get number less than or equal to 12)
    var month = (G<13.5) ? (G-1) : (G-13);
    //if Month is January or February, or the rest of year
    var year = (month<2.5) ? (C-4715) : (C-4716);
    month -= 1; //Handle JavaScript month format
    var UT = B-D-Math.floor(30.6001*G)+F;
    var day = Math.floor(UT);
    //Determine time
    UT -= Math.floor(UT);
    UT *= 24;
    var hour = Math.floor(UT);
    UT -= Math.floor(UT);
    UT *= 60;
    var minute = Math.floor(UT);
    UT -= Math.floor(UT);
    UT *= 60;
    var second = Math.round(UT);

    return new Date(Date.UTC(year, month, day, hour, minute, second));
};

function meanElements( e, JD ){
	var t = JD / 36525;
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
