var timer = function(){
	this.count = 1;
	this.multiplier = .25;
	return this;
}

Date.prototype.Date2Julian = function() {
	return Math.floor( ( this / 86400000 ) - ( this.getTimezoneOffset() / 1440 ) + 2440587.5 );
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
	var month = (G < 13.5) ? ( G - 1 ) : ( G - 13 );

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

function vec3Mid( vec1, vec2 ){
	var vec = new THREE.Vector3();
	vec.x = (vec1.x + vec2.x) / 2;
	vec.y = (vec1.y + vec2.y) / 2;
	vec.z = (vec1.z + vec2.z) / 2;
	return vec;
}

function lineMid( line ){
	var vec = new THREE.Vector3();
	var vec1 = line.geometry.vertices[0].clone();
	var vec2 = line.geometry.vertices[ line.geometry.vertices.length - 1 ].clone();
	vec = vec3Mid( vec1, vec2 );
	return vec;
}

function screenXY( vec3 ) {
    var projector = new THREE.Projector();
    var vector = projector.projectVector( vec3, camera );
    var result = new Object();

    result.x = Math.round(vector.x * (window.innerWidth / 2)) + window.innerWidth / 2;
    result.y = Math.round((0 - vector.y) * (window.innerHeight / 2)) + window.innerHeight / 2;
    return result;
}

function keyInObject( obj ){
	for (var key in obj ) {
	   if (obj.hasOwnProperty(key)) {
	      var o = obj[key];
	      for (var prop in o) {
	         if (o.hasOwnProperty(prop)) {
	            console.log(o[prop]);
	         }
	      }
	   }
	}
}