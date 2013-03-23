var camPosition = function( position, target, time ){
	this.tween = function(){
		TWEEN.removeAll();
		camTweener( position, target, time );
	};
	return this;
}

function camTweener( newCamPosition, newTarget, time ) {

	var update	= function() {
		camera.position = camCurrentPosition;
		camera.rotation = camCurrentRotation;
		camera.lookAt( camCurrentTarget );
	}

	var camCurrentPosition	= camera.position;
	var camCurrentRotation	= camera.rotation;
	var camCurrentTarget = camTarget;

	tweenPosition = new TWEEN.Tween( camCurrentPosition )
		.to( newCamPosition , time )
		.delay(0)
		.easing(TWEEN.Easing.Sinusoidal.InOut)
		.onStart( function(){ 
			controls.enabled = false; 
			controls.update();
		} )
		.onComplete( function(){ 
			controls.enabled = true; 
			controls.update();

		} )
		.onUpdate( update );

	tweenLookAt = new TWEEN.Tween( camCurrentTarget )
		.to( newTarget, time)
		.delay(0)
		.easing(TWEEN.Easing.Sinusoidal.InOut)
		.onUpdate( update )
		.onComplete( function(){
			//update();
			// camTarget = newTarget;
			camera.lookAt( newTarget );
		});

	tweenPosition.start();
	tweenLookAt.start();
}