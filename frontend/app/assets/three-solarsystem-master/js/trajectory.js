
var Trajectory = function( start, end, resolution){

	var start,
		end,
		axisRez,
		axisPoints = [],
		spline,
		splineMat,
		splineGeo,
		splinePoints,
		line
	;

	return {
		
		line: line,

   		drawTrajectory: function ( start, end ) {
   			scene.remove(line);

			axisRez = resolution;
			axisPoints = [ start, end ];

			splineMat = new THREE.LineBasicMaterial( { color: 0x2BBFBD, opacity: 0.25, linewidth: 1 } );

			spline =  new THREE.SplineCurve3( axisPoints );
			splinePoints = spline.getPoints( axisRez );
			splineGeo = new THREE.Geometry();

			for(var i = 0; i < splinePoints.length; i++){
				splineGeo.vertices.push( splinePoints[i] );  
			}

			line = new THREE.Line( splineGeo, splineMat );
			line.updateMatrix();

			scene.add( line );
        },

        removeTrajectory: function( scene ){
        	scene.remove( line );

        }
	}
};
	