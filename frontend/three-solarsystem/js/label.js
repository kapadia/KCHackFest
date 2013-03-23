function updateLabels(){
    for (var i in ss ) {
        var label = ss[i].label;
        label.update();
    }
} 

function showLabels( l, show ){
	for (var i in l) {
        var label = l[i].label;
		if( show ) label.show();
		else label.hide();
	}
}

var Label = function( glObject, size, element ) {
	var template = document.getElementById('label_template');
	var label = template.cloneNode(true);

	label.size = size !== undefined ? size : 1.0;
	label.$ = $( label );

	label.object = glObject;

	label.gyro = new THREE.Gyroscope();
	label.gyroGeo = new THREE.Mesh( new THREE.PlaneGeometry( 0, 0 ), new THREE.MeshLambertMaterial( { color: 0xCC0000, opacity: 1 } ) );
	label.gyroGeo.position.set(1,0,0);
	label.gyro.add( label.gyroGeo );

	label.object.add( label.gyro );

	label.name = label.object.name;
	label.nameLayer = label.children[0];
	label.nameLayer.innerHTML = label.name;

	label.labelWidth = label.$.outerWidth();

	label.visible = false;
    label.visMin = 0;
    label.visMax = 10000;

	element.appendChild( label );

	label.setPosition = function( x, y ) {
		x -= this.labelWidth * 0.5;
        this.style.left = x + 'px';
        this.style.top = y + 'px';
	};

	label.hide = function(){
		this.visible = false;
		this.$.hide();
		//this.$.fadeTo(0.1, 0);
	}

	label.show = function(){
		this.visible = true;
		this.$.show();
		//this.$.fadeTo(0.1, 1);
	}

	label.updateGyro = function(){
		var vector = new THREE.Vector3();
		vector.getPositionFromMatrix( this.gyro.matrixWorld );
		vector.sub( camera.position );
		this.gyro.rotation.y = Math.atan2( vector.x, vector.z) + 3;	
	}

	label.update = function () {

		this.updateGyro();

		var vector = new THREE.Vector3();
		var screenPos = screenXY( vector.getPositionFromMatrix( this.gyroGeo.matrixWorld ) );

		var frustum = new THREE.Frustum();
		frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );

		var inFrustum = frustum.containsPoint( this.object.position );
		var isParentVisible = this.object.visible;
		var distanceTo = this.object.position.clone().distanceTo( camera.position );
		var inCamRange = (distanceTo > this.visMin && distanceTo < this.visMax);
        
        this.setPosition( screenPos.x, screenPos.y );
        if ( this.visible && inCamRange && inFrustum && isParentVisible ) { 
        	this.show();
        }
        else this.hide();
	};

	return label
}