/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / https://github.com/WestLangley
 */

THREE.OrbitControls = function ( object, domElement ) {

	THREE.EventDispatcher.call( this );

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.center = new THREE.Vector3();

	this.userZoom = true;
	this.userZoomSpeed = 1.0;

	this.userRotate = true;
	this.userRotateSpeed = 1.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	this.minDistance = 0;
	this.maxDistance = Infinity;

	// internals

	var scope = this;

	var EPS = 0.000001;
	var PIXELS_PER_ROUND = 1800;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var zoomStart = new THREE.Vector2();
	var zoomEnd = new THREE.Vector2();
	var zoomDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;

	var lastPosition = new THREE.Vector3();

	var STATE = { NONE : -1, ROTATE : 0, ZOOM : 1 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' };


	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateRight = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta += angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	this.rotateDown = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta += angle;

	};

	this.zoomIn = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale /= zoomScale;

	};

	this.zoomOut = function ( zoomScale ) {

		if ( zoomScale === undefined ) {

			zoomScale = getZoomScale();

		}

		scale *= zoomScale;

	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().sub( this.center )

		// angle from z-axis around y-axis

		var theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		position.copy( this.center ).add( offset );

		this.object.lookAt( this.center );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;

		if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );

		}

	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.userZoomSpeed );

	}

	function onMouseDown( event ) {

		if ( !scope.userRotate ) return;

		event.preventDefault();

		if ( event.button === 0 || event.button === 2 ) {

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

			zoomStart.set( event.clientX, event.clientY );

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		event.preventDefault();

		if ( state === STATE.ROTATE ) {

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.ZOOM ) {

			zoomEnd.set( event.clientX, event.clientY );
			zoomDelta.subVectors( zoomEnd, zoomStart );

			if ( zoomDelta.y > 0 ) {

				scope.zoomIn();

			} else {

				scope.zoomOut();

			}

			zoomStart.copy( zoomEnd );

		}

	}

	function onMouseUp( event ) {

		if ( ! scope.userRotate ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( ! scope.userZoom ) return;

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.zoomOut();

		} else {

			scope.zoomIn();

		}

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

};
/**
 * @author Tim Knip / http://www.floorplanner.com/ / tim at floorplanner.com
 */

THREE.ColladaLoader = function () {

	var COLLADA = null;
	var scene = null;
	var daeScene;

	var readyCallbackFunc = null;

 	var sources = {};
	var images = {};
	var animations = {};
	var controllers = {};
	var geometries = {};
	var materials = {};
	var effects = {};
	var cameras = {};

	var animData;
	var visualScenes;
	var baseUrl;
	var morphs;
	var skins;

	var flip_uv = true;
	var preferredShading = THREE.SmoothShading;

	var options = {
		// Force Geometry to always be centered at the local origin of the
		// containing Mesh.
		centerGeometry: false,

		// Axis conversion is done for geometries, animations, and controllers.
		// If we ever pull cameras or lights out of the COLLADA file, they'll
		// need extra work.
		convertUpAxis: false,

		subdivideFaces: true,

		upAxis: 'Y',

		// For reflective or refractive materials we'll use this cubemap
		defaultEnvMap: null

	};

	var colladaUnit = 1.0;
	var colladaUp = 'Y';
	var upConversion = null;

	function load ( url, readyCallback, progressCallback ) {

		var length = 0;

		if ( document.implementation && document.implementation.createDocument ) {

			var request = new XMLHttpRequest();

			request.onreadystatechange = function() {

				if( request.readyState == 4 ) {

					if( request.status == 0 || request.status == 200 ) {


						if ( request.responseXML ) {

							readyCallbackFunc = readyCallback;
							parse( request.responseXML, undefined, url );

						} else if ( request.responseText ) {

							readyCallbackFunc = readyCallback;
							var xmlParser = new DOMParser();
							var responseXML = xmlParser.parseFromString( request.responseText, "application/xml" );
							parse( responseXML, undefined, url );

						} else {

							console.error( "ColladaLoader: Empty or non-existing file (" + url + ")" );

						}

					}

				} else if ( request.readyState == 3 ) {

					if ( progressCallback ) {

						if ( length == 0 ) {

							length = request.getResponseHeader( "Content-Length" );

						}

						progressCallback( { total: length, loaded: request.responseText.length } );

					}

				}

			}

			request.open( "GET", url, true );
			request.send( null );

		} else {

			alert( "Don't know how to parse XML!" );

		}

	};

	function parse( doc, callBack, url ) {

		COLLADA = doc;
		callBack = callBack || readyCallbackFunc;

		if ( url !== undefined ) {

			var parts = url.split( '/' );
			parts.pop();
			baseUrl = ( parts.length < 1 ? '.' : parts.join( '/' ) ) + '/';

		}

		parseAsset();
		setUpConversion();
		images = parseLib( "//dae:library_images/dae:image", _Image, "image" );
		materials = parseLib( "//dae:library_materials/dae:material", Material, "material" );
		effects = parseLib( "//dae:library_effects/dae:effect", Effect, "effect" );
		geometries = parseLib( "//dae:library_geometries/dae:geometry", Geometry, "geometry" );
		cameras = parseLib( ".//dae:library_cameras/dae:camera", Camera, "camera" );
		controllers = parseLib( "//dae:library_controllers/dae:controller", Controller, "controller" );
		animations = parseLib( "//dae:library_animations/dae:animation", Animation, "animation" );
		visualScenes = parseLib( ".//dae:library_visual_scenes/dae:visual_scene", VisualScene, "visual_scene" );

		morphs = [];
		skins = [];

		daeScene = parseScene();
		scene = new THREE.Object3D();

		for ( var i = 0; i < daeScene.nodes.length; i ++ ) {

			scene.add( createSceneGraph( daeScene.nodes[ i ] ) );

		}

		// unit conversion
		scene.scale.multiplyScalar( colladaUnit );

		createAnimations();

		var result = {

			scene: scene,
			morphs: morphs,
			skins: skins,
			animations: animData,
			dae: {
				images: images,
				materials: materials,
				cameras: cameras,
				effects: effects,
				geometries: geometries,
				controllers: controllers,
				animations: animations,
				visualScenes: visualScenes,
				scene: daeScene
			}

		};

		if ( callBack ) {

			callBack( result );

		}

		return result;

	};

	function setPreferredShading ( shading ) {

		preferredShading = shading;

	};

	function parseAsset () {

		var elements = COLLADA.evaluate( '//dae:asset', COLLADA, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

		var element = elements.iterateNext();

		if ( element && element.childNodes ) {

			for ( var i = 0; i < element.childNodes.length; i ++ ) {

				var child = element.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'unit':

						var meter = child.getAttribute( 'meter' );

						if ( meter ) {

							colladaUnit = parseFloat( meter );

						}

						break;

					case 'up_axis':

						colladaUp = child.textContent.charAt(0);
						break;

				}

			}

		}

	};

	function parseLib ( q, classSpec, prefix ) {

		var elements = COLLADA.evaluate(q, COLLADA, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null) ;

		var lib = {};
		var element = elements.iterateNext();
		var i = 0;

		while ( element ) {

			var daeElement = ( new classSpec() ).parse( element );
			if ( !daeElement.id || daeElement.id.length == 0 ) daeElement.id = prefix + ( i ++ );
			lib[ daeElement.id ] = daeElement;

			element = elements.iterateNext();

		}

		return lib;

	};

	function parseScene() {

		var sceneElement = COLLADA.evaluate( './/dae:scene/dae:instance_visual_scene', COLLADA, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null ).iterateNext();

		if ( sceneElement ) {

			var url = sceneElement.getAttribute( 'url' ).replace( /^#/, '' );
			return visualScenes[ url.length > 0 ? url : 'visual_scene0' ];

		} else {

			return null;

		}

	};

	function createAnimations() {

		animData = [];

		// fill in the keys
		recurseHierarchy( scene );

	};

	function recurseHierarchy( node ) {

		var n = daeScene.getChildById( node.name, true ),
			newData = null;

		if ( n && n.keys ) {

			newData = {
				fps: 60,
				hierarchy: [ {
					node: n,
					keys: n.keys,
					sids: n.sids
				} ],
				node: node,
				name: 'animation_' + node.name,
				length: 0
			};

			animData.push(newData);

			for ( var i = 0, il = n.keys.length; i < il; i++ ) {

				newData.length = Math.max( newData.length, n.keys[i].time );

			}

		} else  {

			newData = {
				hierarchy: [ {
					keys: [],
					sids: []
				} ]
			}

		}

		for ( var i = 0, il = node.children.length; i < il; i++ ) {

			var d = recurseHierarchy( node.children[i] );

			for ( var j = 0, jl = d.hierarchy.length; j < jl; j ++ ) {

				newData.hierarchy.push( {
					keys: [],
					sids: []
				} );

			}

		}

		return newData;

	};

	function calcAnimationBounds () {

		var start = 1000000;
		var end = -start;
		var frames = 0;

		for ( var id in animations ) {

			var animation = animations[ id ];

			for ( var i = 0; i < animation.sampler.length; i ++ ) {

				var sampler = animation.sampler[ i ];
				sampler.create();

				start = Math.min( start, sampler.startTime );
				end = Math.max( end, sampler.endTime );
				frames = Math.max( frames, sampler.input.length );

			}

		}

		return { start:start, end:end, frames:frames };

	};

	function createMorph ( geometry, ctrl ) {

		var morphCtrl = ctrl instanceof InstanceController ? controllers[ ctrl.url ] : ctrl;

		if ( !morphCtrl || !morphCtrl.morph ) {

			console.log("could not find morph controller!");
			return;

		}

		var morph = morphCtrl.morph;

		for ( var i = 0; i < morph.targets.length; i ++ ) {

			var target_id = morph.targets[ i ];
			var daeGeometry = geometries[ target_id ];

			if ( !daeGeometry.mesh ||
				 !daeGeometry.mesh.primitives ||
				 !daeGeometry.mesh.primitives.length ) {
				 continue;
			}

			var target = daeGeometry.mesh.primitives[ 0 ].geometry;

			if ( target.vertices.length === geometry.vertices.length ) {

				geometry.morphTargets.push( { name: "target_1", vertices: target.vertices } );

			}

		}

		geometry.morphTargets.push( { name: "target_Z", vertices: geometry.vertices } );

	};

	function createSkin ( geometry, ctrl, applyBindShape ) {

		var skinCtrl = controllers[ ctrl.url ];

		if ( !skinCtrl || !skinCtrl.skin ) {

			console.log( "could not find skin controller!" );
			return;

		}

		if ( !ctrl.skeleton || !ctrl.skeleton.length ) {

			console.log( "could not find the skeleton for the skin!" );
			return;

		}

		var skin = skinCtrl.skin;
		var skeleton = daeScene.getChildById( ctrl.skeleton[ 0 ] );
		var hierarchy = [];

		applyBindShape = applyBindShape !== undefined ? applyBindShape : true;

		var bones = [];
		geometry.skinWeights = [];
		geometry.skinIndices = [];

		//createBones( geometry.bones, skin, hierarchy, skeleton, null, -1 );
		//createWeights( skin, geometry.bones, geometry.skinIndices, geometry.skinWeights );

		/*
		geometry.animation = {
			name: 'take_001',
			fps: 30,
			length: 2,
			JIT: true,
			hierarchy: hierarchy
		};
		*/

		if ( applyBindShape ) {

			for ( var i = 0; i < geometry.vertices.length; i ++ ) {

				geometry.vertices[ i ].applyMatrix4( skin.bindShapeMatrix );

			}

		}

	};

	function setupSkeleton ( node, bones, frame, parent ) {

		node.world = node.world || new THREE.Matrix4();
		node.world.copy( node.matrix );

		if ( node.channels && node.channels.length ) {

			var channel = node.channels[ 0 ];
			var m = channel.sampler.output[ frame ];

			if ( m instanceof THREE.Matrix4 ) {

				node.world.copy( m );

			}

		}

		if ( parent ) {

			node.world.multiplyMatrices( parent, node.world );

		}

		bones.push( node );

		for ( var i = 0; i < node.nodes.length; i ++ ) {

			setupSkeleton( node.nodes[ i ], bones, frame, node.world );

		}

	};

	function setupSkinningMatrices ( bones, skin ) {

		// FIXME: this is dumb...

		for ( var i = 0; i < bones.length; i ++ ) {

			var bone = bones[ i ];
			var found = -1;

			if ( bone.type != 'JOINT' ) continue;

			for ( var j = 0; j < skin.joints.length; j ++ ) {

				if ( bone.sid == skin.joints[ j ] ) {

					found = j;
					break;

				}

			}

			if ( found >= 0 ) {

				var inv = skin.invBindMatrices[ found ];

				bone.invBindMatrix = inv;
				bone.skinningMatrix = new THREE.Matrix4();
				bone.skinningMatrix.multiplyMatrices(bone.world, inv); // (IBMi * JMi)

				bone.weights = [];

				for ( var j = 0; j < skin.weights.length; j ++ ) {

					for (var k = 0; k < skin.weights[ j ].length; k ++) {

						var w = skin.weights[ j ][ k ];

						if ( w.joint == found ) {

							bone.weights.push( w );

						}

					}

				}

			} else {

				throw 'ColladaLoader: Could not find joint \'' + bone.sid + '\'.';

			}

		}

	};

	function applySkin ( geometry, instanceCtrl, frame ) {

		var skinController = controllers[ instanceCtrl.url ];

		frame = frame !== undefined ? frame : 40;

		if ( !skinController || !skinController.skin ) {

			console.log( 'ColladaLoader: Could not find skin controller.' );
			return;

		}

		if ( !instanceCtrl.skeleton || !instanceCtrl.skeleton.length ) {

			console.log( 'ColladaLoader: Could not find the skeleton for the skin. ' );
			return;

		}

		var animationBounds = calcAnimationBounds();
		var skeleton = daeScene.getChildById( instanceCtrl.skeleton[0], true ) ||
					   daeScene.getChildBySid( instanceCtrl.skeleton[0], true );

		var i, j, w, vidx, weight;
		var v = new THREE.Vector3(), o, s;

		// move vertices to bind shape

		for ( i = 0; i < geometry.vertices.length; i ++ ) {

			geometry.vertices[i].applyMatrix4( skinController.skin.bindShapeMatrix );

		}

		// process animation, or simply pose the rig if no animation

		for ( frame = 0; frame < animationBounds.frames; frame ++ ) {

			var bones = [];
			var skinned = [];

			// zero skinned vertices

			for ( i = 0; i < geometry.vertices.length; i++ ) {

				skinned.push( new THREE.Vector3() );

			}

			// process the frame and setup the rig with a fresh
			// transform, possibly from the bone's animation channel(s)

			setupSkeleton( skeleton, bones, frame );
			setupSkinningMatrices( bones, skinController.skin );

			// skin 'm

			for ( i = 0; i < bones.length; i ++ ) {

				if ( bones[ i ].type != 'JOINT' ) continue;

				for ( j = 0; j < bones[ i ].weights.length; j ++ ) {

					w = bones[ i ].weights[ j ];
					vidx = w.index;
					weight = w.weight;

					o = geometry.vertices[vidx];
					s = skinned[vidx];

					v.x = o.x;
					v.y = o.y;
					v.z = o.z;

					v.applyMatrix4( bones[i].skinningMatrix );

					s.x += (v.x * weight);
					s.y += (v.y * weight);
					s.z += (v.z * weight);

				}

			}

			geometry.morphTargets.push( { name: "target_" + frame, vertices: skinned } );

		}

	};

	function createSceneGraph ( node, parent ) {

		var obj = new THREE.Object3D();
		var skinned = false;
		var skinController;
		var morphController;
		var i, j;

		// FIXME: controllers

		for ( i = 0; i < node.controllers.length; i ++ ) {

			var controller = controllers[ node.controllers[ i ].url ];

			switch ( controller.type ) {

				case 'skin':

					if ( geometries[ controller.skin.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.skin.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						skinned = true;
						skinController = node.controllers[ i ];

					} else if ( controllers[ controller.skin.source ] ) {

						// urgh: controller can be chained
						// handle the most basic case...

						var second = controllers[ controller.skin.source ];
						morphController = second;
					//	skinController = node.controllers[i];

						if ( second.morph && geometries[ second.morph.source ] ) {

							var inst_geom = new InstanceGeometry();

							inst_geom.url = second.morph.source;
							inst_geom.instance_material = node.controllers[ i ].instance_material;

							node.geometries.push( inst_geom );

						}

					}

					break;

				case 'morph':

					if ( geometries[ controller.morph.source ] ) {

						var inst_geom = new InstanceGeometry();

						inst_geom.url = controller.morph.source;
						inst_geom.instance_material = node.controllers[ i ].instance_material;

						node.geometries.push( inst_geom );
						morphController = node.controllers[ i ];

					}

					console.log( 'ColladaLoader: Morph-controller partially supported.' );

				default:
					break;

			}

		}

		// FIXME: multi-material mesh?
		// geometries

		var double_sided_materials = {};

		for ( i = 0; i < node.geometries.length; i ++ ) {

			var instance_geometry = node.geometries[i];
			var instance_materials = instance_geometry.instance_material;
			var geometry = geometries[ instance_geometry.url ];
			var used_materials = {};
			var used_materials_array = [];
			var num_materials = 0;
			var first_material;

			if ( geometry ) {

				if ( !geometry.mesh || !geometry.mesh.primitives )
					continue;

				if ( obj.name.length == 0 ) {

					obj.name = geometry.id;

				}

				// collect used fx for this geometry-instance

				if ( instance_materials ) {

					for ( j = 0; j < instance_materials.length; j ++ ) {

						var instance_material = instance_materials[ j ];
						var mat = materials[ instance_material.target ];
						var effect_id = mat.instance_effect.url;
						var shader = effects[ effect_id ].shader;
						var material3js = shader.material;

						if ( geometry.doubleSided ) {

							if ( !( material3js in double_sided_materials ) ) {

								var _copied_material = material3js.clone();
								_copied_material.side = THREE.DoubleSide;
								double_sided_materials[ material3js ] = _copied_material;

							}

							material3js = double_sided_materials[ material3js ];

						}

						material3js.opacity = !material3js.opacity ? 1 : material3js.opacity;
						used_materials[ instance_material.symbol ] = num_materials;
						used_materials_array.push( material3js );
						first_material = material3js;
						first_material.name = mat.name == null || mat.name === '' ? mat.id : mat.name;
						num_materials ++;

					}

				}

				var mesh;
				var material = first_material || new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.FlatShading, side: geometry.doubleSided ? THREE.DoubleSide : THREE.FrontSide } );
				var geom = geometry.mesh.geometry3js;

				if ( num_materials > 1 ) {

					material = new THREE.MeshFaceMaterial( used_materials_array );

					for ( j = 0; j < geom.faces.length; j ++ ) {

						var face = geom.faces[ j ];
						face.materialIndex = used_materials[ face.daeMaterial ]

					}

				}

				if ( skinController !== undefined ) {

					applySkin( geom, skinController );

					material.morphTargets = true;

					mesh = new THREE.SkinnedMesh( geom, material, false );
					mesh.skeleton = skinController.skeleton;
					mesh.skinController = controllers[ skinController.url ];
					mesh.skinInstanceController = skinController;
					mesh.name = 'skin_' + skins.length;

					skins.push( mesh );

				} else if ( morphController !== undefined ) {

					createMorph( geom, morphController );

					material.morphTargets = true;

					mesh = new THREE.Mesh( geom, material );
					mesh.name = 'morph_' + morphs.length;

					morphs.push( mesh );

				} else {

					mesh = new THREE.Mesh( geom, material );
					// mesh.geom.name = geometry.id;

				}

				node.geometries.length > 1 ? obj.add( mesh ) : obj = mesh;

			}

		}

		for ( i = 0; i < node.cameras.length; i ++ ) {

			var instance_camera = node.cameras[i];
			var cparams = cameras[instance_camera.url];

			obj = new THREE.PerspectiveCamera(cparams.fov, cparams.aspect_ratio, cparams.znear, cparams.zfar);

		}

		obj.name = node.name || node.id || "";
		obj.matrix = node.matrix;

		var props = node.matrix.decompose();
		obj.position = props[ 0 ];
		obj.quaternion = props[ 1 ];
		obj.useQuaternion = true;
		obj.scale = props[ 2 ];

		if ( options.centerGeometry && obj.geometry ) {

			var delta = THREE.GeometryUtils.center( obj.geometry );
			delta.multiply( obj.scale );
			delta.applyQuaternion( obj.quaternion );

			obj.position.sub( delta );

		}

		for ( i = 0; i < node.nodes.length; i ++ ) {

			obj.add( createSceneGraph( node.nodes[i], node ) );

		}

		return obj;

	};

	function getJointId( skin, id ) {

		for ( var i = 0; i < skin.joints.length; i ++ ) {

			if ( skin.joints[ i ] == id ) {

				return i;

			}

		}

	};

	function getLibraryNode( id ) {

		return COLLADA.evaluate( './/dae:library_nodes//dae:node[@id=\'' + id + '\']', COLLADA, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null ).iterateNext();

	};

	function getChannelsForNode (node ) {

		var channels = [];
		var startTime = 1000000;
		var endTime = -1000000;

		for ( var id in animations ) {

			var animation = animations[id];

			for ( var i = 0; i < animation.channel.length; i ++ ) {

				var channel = animation.channel[i];
				var sampler = animation.sampler[i];
				var id = channel.target.split('/')[0];

				if ( id == node.id ) {

					sampler.create();
					channel.sampler = sampler;
					startTime = Math.min(startTime, sampler.startTime);
					endTime = Math.max(endTime, sampler.endTime);
					channels.push(channel);

				}

			}

		}

		if ( channels.length ) {

			node.startTime = startTime;
			node.endTime = endTime;

		}

		return channels;

	};

	function calcFrameDuration( node ) {

		var minT = 10000000;

		for ( var i = 0; i < node.channels.length; i ++ ) {

			var sampler = node.channels[i].sampler;

			for ( var j = 0; j < sampler.input.length - 1; j ++ ) {

				var t0 = sampler.input[ j ];
				var t1 = sampler.input[ j + 1 ];
				minT = Math.min( minT, t1 - t0 );

			}
		}

		return minT;

	};

	function calcMatrixAt( node, t ) {

		var animated = {};

		var i, j;

		for ( i = 0; i < node.channels.length; i ++ ) {

			var channel = node.channels[ i ];
			animated[ channel.sid ] = channel;

		}

		var matrix = new THREE.Matrix4();

		for ( i = 0; i < node.transforms.length; i ++ ) {

			var transform = node.transforms[ i ];
			var channel = animated[ transform.sid ];

			if ( channel !== undefined ) {

				var sampler = channel.sampler;
				var value;

				for ( j = 0; j < sampler.input.length - 1; j ++ ) {

					if ( sampler.input[ j + 1 ] > t ) {

						value = sampler.output[ j ];
						//console.log(value.flatten)
						break;

					}

				}

				if ( value !== undefined ) {

					if ( value instanceof THREE.Matrix4 ) {

						matrix.multiplyMatrices( matrix, value );

					} else {

						// FIXME: handle other types

						matrix.multiplyMatrices( matrix, transform.matrix );

					}

				} else {

					matrix.multiplyMatrices( matrix, transform.matrix );

				}

			} else {

				matrix.multiplyMatrices( matrix, transform.matrix );

			}

		}

		return matrix;

	};

	function bakeAnimations ( node ) {

		if ( node.channels && node.channels.length ) {

			var keys = [],
				sids = [];

			for ( var i = 0, il = node.channels.length; i < il; i++ ) {

				var channel = node.channels[i],
					fullSid = channel.fullSid,
					sampler = channel.sampler,
					input = sampler.input,
					transform = node.getTransformBySid( channel.sid ),
					member;

				if ( channel.arrIndices ) {

					member = [];

					for ( var j = 0, jl = channel.arrIndices.length; j < jl; j++ ) {

						member[ j ] = getConvertedIndex( channel.arrIndices[ j ] );

					}

				} else {

					member = getConvertedMember( channel.member );

				}

				if ( transform ) {

					if ( sids.indexOf( fullSid ) === -1 ) {

						sids.push( fullSid );

					}

					for ( var j = 0, jl = input.length; j < jl; j++ ) {

						var time = input[j],
							data = sampler.getData( transform.type, j ),
							key = findKey( keys, time );

						if ( !key ) {

							key = new Key( time );
							var timeNdx = findTimeNdx( keys, time );
							keys.splice( timeNdx == -1 ? keys.length : timeNdx, 0, key );

						}

						key.addTarget( fullSid, transform, member, data );

					}

				} else {

					console.log( 'Could not find transform "' + channel.sid + '" in node ' + node.id );

				}

			}

			// post process
			for ( var i = 0; i < sids.length; i++ ) {

				var sid = sids[ i ];

				for ( var j = 0; j < keys.length; j++ ) {

					var key = keys[ j ];

					if ( !key.hasTarget( sid ) ) {

						interpolateKeys( keys, key, j, sid );

					}

				}

			}

			node.keys = keys;
			node.sids = sids;

		}

	};

	function findKey ( keys, time) {

		var retVal = null;

		for ( var i = 0, il = keys.length; i < il && retVal == null; i++ ) {

			var key = keys[i];

			if ( key.time === time ) {

				retVal = key;

			} else if ( key.time > time ) {

				break;

			}

		}

		return retVal;

	};

	function findTimeNdx ( keys, time) {

		var ndx = -1;

		for ( var i = 0, il = keys.length; i < il && ndx == -1; i++ ) {

			var key = keys[i];

			if ( key.time >= time ) {

				ndx = i;

			}

		}

		return ndx;

	};

	function interpolateKeys ( keys, key, ndx, fullSid ) {

		var prevKey = getPrevKeyWith( keys, fullSid, ndx ? ndx-1 : 0 ),
			nextKey = getNextKeyWith( keys, fullSid, ndx+1 );

		if ( prevKey && nextKey ) {

			var scale = (key.time - prevKey.time) / (nextKey.time - prevKey.time),
				prevTarget = prevKey.getTarget( fullSid ),
				nextData = nextKey.getTarget( fullSid ).data,
				prevData = prevTarget.data,
				data;

			if ( prevTarget.type === 'matrix' ) {

				data = prevData;

			} else if ( prevData.length ) {

				data = [];

				for ( var i = 0; i < prevData.length; ++i ) {

					data[ i ] = prevData[ i ] + ( nextData[ i ] - prevData[ i ] ) * scale;

				}

			} else {

				data = prevData + ( nextData - prevData ) * scale;

			}

			key.addTarget( fullSid, prevTarget.transform, prevTarget.member, data );

		}

	};

	// Get next key with given sid

	function getNextKeyWith( keys, fullSid, ndx ) {

		for ( ; ndx < keys.length; ndx++ ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	};

	// Get previous key with given sid

	function getPrevKeyWith( keys, fullSid, ndx ) {

		ndx = ndx >= 0 ? ndx : ndx + keys.length;

		for ( ; ndx >= 0; ndx-- ) {

			var key = keys[ ndx ];

			if ( key.hasTarget( fullSid ) ) {

				return key;

			}

		}

		return null;

	};

	function _Image() {

		this.id = "";
		this.init_from = "";

	};

	_Image.prototype.parse = function(element) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName == 'init_from' ) {

				this.init_from = child.textContent;

			}

		}

		return this;

	};

	function Controller() {

		this.id = "";
		this.name = "";
		this.type = "";
		this.skin = null;
		this.morph = null;

	};

	Controller.prototype.parse = function( element ) {

		this.id = element.getAttribute('id');
		this.name = element.getAttribute('name');
		this.type = "none";

		for ( var i = 0; i < element.childNodes.length; i++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'skin':

					this.skin = (new Skin()).parse(child);
					this.type = child.nodeName;
					break;

				case 'morph':

					this.morph = (new Morph()).parse(child);
					this.type = child.nodeName;
					break;

				default:
					break;

			}
		}

		return this;

	};

	function Morph() {

		this.method = null;
		this.source = null;
		this.targets = null;
		this.weights = null;

	};

	Morph.prototype.parse = function( element ) {

		var sources = {};
		var inputs = [];
		var i;

		this.method = element.getAttribute( 'method' );
		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					var source = ( new Source() ).parse( child );
					sources[ source.id ] = source;
					break;

				case 'targets':

					inputs = this.parseInputs( child );
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		for ( i = 0; i < inputs.length; i ++ ) {

			var input = inputs[ i ];
			var source = sources[ input.source ];

			switch ( input.semantic ) {

				case 'MORPH_TARGET':

					this.targets = source.read();
					break;

				case 'MORPH_WEIGHT':

					this.weights = source.read();
					break;

				default:
					break;

			}
		}

		return this;

	};

	Morph.prototype.parseInputs = function(element) {

		var inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( (new Input()).parse(child) );
					break;

				default:
					break;
			}
		}

		return inputs;

	};

	function Skin() {

		this.source = "";
		this.bindShapeMatrix = null;
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

	};

	Skin.prototype.parse = function( element ) {

		var sources = {};
		var joints, weights;

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.invBindMatrices = [];
		this.joints = [];
		this.weights = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'bind_shape_matrix':

					var f = _floats(child.textContent);
					this.bindShapeMatrix = getConvertedMat4( f );
					break;

				case 'source':

					var src = new Source().parse(child);
					sources[ src.id ] = src;
					break;

				case 'joints':

					joints = child;
					break;

				case 'vertex_weights':

					weights = child;
					break;

				default:

					console.log( child.nodeName );
					break;

			}
		}

		this.parseJoints( joints, sources );
		this.parseWeights( weights, sources );

		return this;

	};

	Skin.prototype.parseJoints = function ( element, sources ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					var input = ( new Input() ).parse( child );
					var source = sources[ input.source ];

					if ( input.semantic == 'JOINT' ) {

						this.joints = source.read();

					} else if ( input.semantic == 'INV_BIND_MATRIX' ) {

						this.invBindMatrices = source.read();

					}

					break;

				default:
					break;
			}

		}

	};

	Skin.prototype.parseWeights = function ( element, sources ) {

		var v, vcount, inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					inputs.push( ( new Input() ).parse( child ) );
					break;

				case 'v':

					v = _ints( child.textContent );
					break;

				case 'vcount':

					vcount = _ints( child.textContent );
					break;

				default:
					break;

			}

		}

		var index = 0;

		for ( var i = 0; i < vcount.length; i ++ ) {

			var numBones = vcount[i];
			var vertex_weights = [];

			for ( var j = 0; j < numBones; j++ ) {

				var influence = {};

				for ( var k = 0; k < inputs.length; k ++ ) {

					var input = inputs[ k ];
					var value = v[ index + input.offset ];

					switch ( input.semantic ) {

						case 'JOINT':

							influence.joint = value;//this.joints[value];
							break;

						case 'WEIGHT':

							influence.weight = sources[ input.source ].data[ value ];
							break;

						default:
							break;

					}

				}

				vertex_weights.push( influence );
				index += inputs.length;
			}

			for ( var j = 0; j < vertex_weights.length; j ++ ) {

				vertex_weights[ j ].index = i;

			}

			this.weights.push( vertex_weights );

		}

	};

	function VisualScene () {

		this.id = "";
		this.name = "";
		this.nodes = [];
		this.scene = new THREE.Object3D();

	};

	VisualScene.prototype.getChildById = function( id, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildById( id, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.getChildBySid = function( sid, recursive ) {

		for ( var i = 0; i < this.nodes.length; i ++ ) {

			var node = this.nodes[ i ].getChildBySid( sid, recursive );

			if ( node ) {

				return node;

			}

		}

		return null;

	};

	VisualScene.prototype.parse = function( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.nodes = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Node() {

		this.id = "";
		this.name = "";
		this.sid = "";
		this.nodes = [];
		this.controllers = [];
		this.transforms = [];
		this.geometries = [];
		this.channels = [];
		this.matrix = new THREE.Matrix4();

	};

	Node.prototype.getChannelForTransform = function( transformSid ) {

		for ( var i = 0; i < this.channels.length; i ++ ) {

			var channel = this.channels[i];
			var parts = channel.target.split('/');
			var id = parts.shift();
			var sid = parts.shift();
			var dotSyntax = (sid.indexOf(".") >= 0);
			var arrSyntax = (sid.indexOf("(") >= 0);
			var arrIndices;
			var member;

			if ( dotSyntax ) {

				parts = sid.split(".");
				sid = parts.shift();
				member = parts.shift();

			} else if ( arrSyntax ) {

				arrIndices = sid.split("(");
				sid = arrIndices.shift();

				for ( var j = 0; j < arrIndices.length; j ++ ) {

					arrIndices[ j ] = parseInt( arrIndices[ j ].replace( /\)/, '' ) );

				}

			}

			if ( sid == transformSid ) {

				channel.info = { sid: sid, dotSyntax: dotSyntax, arrSyntax: arrSyntax, arrIndices: arrIndices };
				return channel;

			}

		}

		return null;

	};

	Node.prototype.getChildById = function ( id, recursive ) {

		if ( this.id == id ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildById( id, recursive );

				if ( n ) {

					return n;

				}

			}

		}

		return null;

	};

	Node.prototype.getChildBySid = function ( sid, recursive ) {

		if ( this.sid == sid ) {

			return this;

		}

		if ( recursive ) {

			for ( var i = 0; i < this.nodes.length; i ++ ) {

				var n = this.nodes[ i ].getChildBySid( sid, recursive );

				if ( n ) {

					return n;

				}

			}
		}

		return null;

	};

	Node.prototype.getTransformBySid = function ( sid ) {

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			if ( this.transforms[ i ].sid == sid ) return this.transforms[ i ];

		}

		return null;

	};

	Node.prototype.parse = function( element ) {

		var url;

		this.id = element.getAttribute('id');
		this.sid = element.getAttribute('sid');
		this.name = element.getAttribute('name');
		this.type = element.getAttribute('type');

		this.type = this.type == 'JOINT' ? this.type : 'NODE';

		this.nodes = [];
		this.transforms = [];
		this.geometries = [];
		this.cameras = [];
		this.controllers = [];
		this.matrix = new THREE.Matrix4();

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'node':

					this.nodes.push( ( new Node() ).parse( child ) );
					break;

				case 'instance_camera':

					this.cameras.push( ( new InstanceCamera() ).parse( child ) );
					break;

				case 'instance_controller':

					this.controllers.push( ( new InstanceController() ).parse( child ) );
					break;

				case 'instance_geometry':

					this.geometries.push( ( new InstanceGeometry() ).parse( child ) );
					break;

				case 'instance_light':

					break;

				case 'instance_node':

					url = child.getAttribute( 'url' ).replace( /^#/, '' );
					var iNode = getLibraryNode( url );

					if ( iNode ) {

						this.nodes.push( ( new Node() ).parse( iNode )) ;

					}

					break;

				case 'rotate':
				case 'translate':
				case 'scale':
				case 'matrix':
				case 'lookat':
				case 'skew':

					this.transforms.push( ( new Transform() ).parse( child ) );
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		this.channels = getChannelsForNode( this );
		bakeAnimations( this );

		this.updateMatrix();

		return this;

	};

	Node.prototype.updateMatrix = function () {

		this.matrix.identity();

		for ( var i = 0; i < this.transforms.length; i ++ ) {

			this.transforms[ i ].apply( this.matrix );

		}

	};

	function Transform () {

		this.sid = "";
		this.type = "";
		this.data = [];
		this.obj = null;

	};

	Transform.prototype.parse = function ( element ) {

		this.sid = element.getAttribute( 'sid' );
		this.type = element.nodeName;
		this.data = _floats( element.textContent );
		this.convert();

		return this;

	};

	Transform.prototype.convert = function () {

		switch ( this.type ) {

			case 'matrix':

				this.obj = getConvertedMat4( this.data );
				break;

			case 'rotate':

				this.angle = THREE.Math.degToRad( this.data[3] );

			case 'translate':

				fixCoords( this.data, -1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			case 'scale':

				fixCoords( this.data, 1 );
				this.obj = new THREE.Vector3( this.data[ 0 ], this.data[ 1 ], this.data[ 2 ] );
				break;

			default:
				console.log( 'Can not convert Transform of type ' + this.type );
				break;

		}

	};

	Transform.prototype.apply = function ( matrix ) {

		switch ( this.type ) {

			case 'matrix':

				matrix.multiply( this.obj );

				break;

			case 'translate':

				matrix.translate( this.obj );

				break;

			case 'rotate':

				matrix.rotateByAxis( this.obj, this.angle );

				break;

			case 'scale':

				matrix.scale( this.obj );

				break;

		}

	};

	Transform.prototype.update = function ( data, member ) {

		var members = [ 'X', 'Y', 'Z', 'ANGLE' ];

		switch ( this.type ) {

			case 'matrix':

				if ( ! member ) {

					this.obj.copy( data );

				} else if ( member.length === 1 ) {

					switch ( member[ 0 ] ) {

						case 0:

							this.obj.n11 = data[ 0 ];
							this.obj.n21 = data[ 1 ];
							this.obj.n31 = data[ 2 ];
							this.obj.n41 = data[ 3 ];

							break;

						case 1:

							this.obj.n12 = data[ 0 ];
							this.obj.n22 = data[ 1 ];
							this.obj.n32 = data[ 2 ];
							this.obj.n42 = data[ 3 ];

							break;

						case 2:

							this.obj.n13 = data[ 0 ];
							this.obj.n23 = data[ 1 ];
							this.obj.n33 = data[ 2 ];
							this.obj.n43 = data[ 3 ];

							break;

						case 3:

							this.obj.n14 = data[ 0 ];
							this.obj.n24 = data[ 1 ];
							this.obj.n34 = data[ 2 ];
							this.obj.n44 = data[ 3 ];

							break;

					}

				} else if ( member.length === 2 ) {

					var propName = 'n' + ( member[ 0 ] + 1 ) + ( member[ 1 ] + 1 );
					this.obj[ propName ] = data;

				} else {

					console.log('Incorrect addressing of matrix in transform.');

				}

				break;

			case 'translate':
			case 'scale':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						break;

				}

				break;

			case 'rotate':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					case 'ANGLE':

						this.angle = THREE.Math.degToRad( data );
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						this.angle = THREE.Math.degToRad( data[ 3 ] );
						break;

				}
				break;

		}

	};

	function InstanceController() {

		this.url = "";
		this.skeleton = [];
		this.instance_material = [];

	};

	InstanceController.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.skeleton = [];
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType !== 1 ) continue;

			switch ( child.nodeName ) {

				case 'skeleton':

					this.skeleton.push( child.textContent.replace(/^#/, '') );
					break;

				case 'bind_material':

					var instances = COLLADA.evaluate( './/dae:instance_material', child, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

					if ( instances ) {

						var instance = instances.iterateNext();

						while ( instance ) {

							this.instance_material.push( (new InstanceMaterial()).parse(instance) );
							instance = instances.iterateNext();

						}

					}

					break;

				case 'extra':
					break;

				default:
					break;

			}
		}

		return this;

	};

	function InstanceMaterial () {

		this.symbol = "";
		this.target = "";

	};

	InstanceMaterial.prototype.parse = function ( element ) {

		this.symbol = element.getAttribute('symbol');
		this.target = element.getAttribute('target').replace(/^#/, '');
		return this;

	};

	function InstanceGeometry() {

		this.url = "";
		this.instance_material = [];

	};

	InstanceGeometry.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');
		this.instance_material = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			if ( child.nodeName == 'bind_material' ) {

				var instances = COLLADA.evaluate( './/dae:instance_material', child, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

				if ( instances ) {

					var instance = instances.iterateNext();

					while ( instance ) {

						this.instance_material.push( (new InstanceMaterial()).parse(instance) );
						instance = instances.iterateNext();

					}

				}

				break;

			}

		}

		return this;

	};

	function Geometry() {

		this.id = "";
		this.mesh = null;

	};

	Geometry.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		extractDoubleSided( this, element );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'mesh':

					this.mesh = (new Mesh(this)).parse(child);
					break;

				case 'extra':

					// console.log( child );
					break;

				default:
					break;
			}
		}

		return this;

	};

	function Mesh( geometry ) {

		this.geometry = geometry.id;
		this.primitives = [];
		this.vertices = null;
		this.geometry3js = null;

	};

	Mesh.prototype.parse = function( element ) {

		this.primitives = [];

		var i, j;

		for ( i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'source':

					_source( child );
					break;

				case 'vertices':

					this.vertices = ( new Vertices() ).parse( child );
					break;

				case 'triangles':

					this.primitives.push( ( new Triangles().parse( child ) ) );
					break;

				case 'polygons':

					this.primitives.push( ( new Polygons().parse( child ) ) );
					break;

				case 'polylist':

					this.primitives.push( ( new Polylist().parse( child ) ) );
					break;

				default:
					break;

			}

		}

		this.geometry3js = new THREE.Geometry();

		var vertexData = sources[ this.vertices.input['POSITION'].source ].data;

		for ( i = 0; i < vertexData.length; i += 3 ) {

			this.geometry3js.vertices.push( getConvertedVec3( vertexData, i ).clone() );

		}

		for ( i = 0; i < this.primitives.length; i ++ ) {

			var primitive = this.primitives[ i ];
			primitive.setVertices( this.vertices );
			this.handlePrimitive( primitive, this.geometry3js );

		}

		this.geometry3js.computeCentroids();
		this.geometry3js.computeFaceNormals();

		if ( this.geometry3js.calcNormals ) {

			this.geometry3js.computeVertexNormals();
			delete this.geometry3js.calcNormals;

		}

		this.geometry3js.computeBoundingBox();

		return this;

	};

	Mesh.prototype.handlePrimitive = function( primitive, geom ) {

		var j, k, pList = primitive.p, inputs = primitive.inputs;
		var input, index, idx32;
		var source, numParams;
		var vcIndex = 0, vcount = 3, maxOffset = 0;
		var texture_sets = [];

		for ( j = 0; j < inputs.length; j ++ ) {

			input = inputs[ j ];
			var offset = input.offset + 1;
			maxOffset = (maxOffset < offset)? offset : maxOffset;

			switch ( input.semantic ) {

				case 'TEXCOORD':
					texture_sets.push( input.set );
					break;

			}

		}

		for ( var pCount = 0; pCount < pList.length; ++pCount ) {

			var p = pList[ pCount ], i = 0;

			while ( i < p.length ) {

				var vs = [];
				var ns = [];
				var ts = null;
				var cs = [];

				if ( primitive.vcount ) {

					vcount = primitive.vcount.length ? primitive.vcount[ vcIndex ++ ] : primitive.vcount;

				} else {

					vcount = p.length / maxOffset;

				}


				for ( j = 0; j < vcount; j ++ ) {

					for ( k = 0; k < inputs.length; k ++ ) {

						input = inputs[ k ];
						source = sources[ input.source ];

						index = p[ i + ( j * maxOffset ) + input.offset ];
						numParams = source.accessor.params.length;
						idx32 = index * numParams;

						switch ( input.semantic ) {

							case 'VERTEX':

								vs.push( index );

								break;

							case 'NORMAL':

								ns.push( getConvertedVec3( source.data, idx32 ) );

								break;

							case 'TEXCOORD':

								ts = ts || { };
								if ( ts[ input.set ] === undefined ) ts[ input.set ] = [];
								// invert the V
								ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], source.data[ idx32 + 1 ] ) );

								break;

							case 'COLOR':

								cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

								break;

							default:

								break;

						}

					}

				}

				if ( ns.length == 0 ) {

					// check the vertices inputs
					input = this.vertices.input.NORMAL;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx++ ) {

							ns.push( getConvertedVec3( source.data, vs[ ndx ] * numParams ) );

						}

					} else {

						geom.calcNormals = true;

					}

				}

				if ( !ts ) {

					ts = { };
					// check the vertices inputs
					input = this.vertices.input.TEXCOORD;

					if ( input ) {

						texture_sets.push( input.set );
						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx++ ) {

							idx32 = vs[ ndx ] * numParams;
							if ( ts[ input.set ] === undefined ) ts[ input.set ] = [ ];
							// invert the V
							ts[ input.set ].push( new THREE.Vector2( source.data[ idx32 ], 1.0 - source.data[ idx32 + 1 ] ) );

						}

					}

				}

				if ( cs.length == 0 ) {

					// check the vertices inputs
					input = this.vertices.input.COLOR;

					if ( input ) {

						source = sources[ input.source ];
						numParams = source.accessor.params.length;

						for ( var ndx = 0, len = vs.length; ndx < len; ndx++ ) {

							idx32 = vs[ ndx ] * numParams;
							cs.push( new THREE.Color().setRGB( source.data[ idx32 ], source.data[ idx32 + 1 ], source.data[ idx32 + 2 ] ) );

						}

					}

				}

				var face = null, faces = [], uv, uvArr;

				if ( vcount === 3 ) {

					faces.push( new THREE.Face3( vs[0], vs[1], vs[2], ns, cs.length ? cs : new THREE.Color() ) );

				} else if ( vcount === 4 ) {
					faces.push( new THREE.Face4( vs[0], vs[1], vs[2], vs[3], ns, cs.length ? cs : new THREE.Color() ) );

				} else if ( vcount > 4 && options.subdivideFaces ) {

					var clr = cs.length ? cs : new THREE.Color(),
						vec1, vec2, vec3, v1, v2, norm;

					// subdivide into multiple Face3s

					for ( k = 1; k < vcount - 1; ) {

						// FIXME: normals don't seem to be quite right

						faces.push( new THREE.Face3( vs[0], vs[k], vs[k+1], [ ns[0], ns[k++], ns[k] ],  clr ) );

					}

				}

				if ( faces.length ) {

					for ( var ndx = 0, len = faces.length; ndx < len; ndx ++ ) {

						face = faces[ndx];
						face.daeMaterial = primitive.material;
						geom.faces.push( face );

						for ( k = 0; k < texture_sets.length; k++ ) {

							uv = ts[ texture_sets[k] ];

							if ( vcount > 4 ) {

								// Grab the right UVs for the vertices in this face
								uvArr = [ uv[0], uv[ndx+1], uv[ndx+2] ];

							} else if ( vcount === 4 ) {

								uvArr = [ uv[0], uv[1], uv[2], uv[3] ];

							} else {

								uvArr = [ uv[0], uv[1], uv[2] ];

							}

							if ( !geom.faceVertexUvs[k] ) {

								geom.faceVertexUvs[k] = [];

							}

							geom.faceVertexUvs[k].push( uvArr );

						}

					}

				} else {

					console.log( 'dropped face with vcount ' + vcount + ' for geometry with id: ' + geom.id );

				}

				i += maxOffset * vcount;

			}
		}

	};

	function Polygons () {

		this.material = "";
		this.count = 0;
		this.inputs = [];
		this.vcount = null;
		this.p = [];
		this.geometry = new THREE.Geometry();

	};

	Polygons.prototype.setVertices = function ( vertices ) {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			if ( this.inputs[ i ].source == vertices.id ) {

				this.inputs[ i ].source = vertices.input[ 'POSITION' ].source;

			}

		}

	};

	Polygons.prototype.parse = function ( element ) {

		this.material = element.getAttribute( 'material' );
		this.count = _attr_as_int( element, 'count', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( ( new Input() ).parse( element.childNodes[ i ] ) );
					break;

				case 'vcount':

					this.vcount = _ints( child.textContent );
					break;

				case 'p':

					this.p.push( _ints( child.textContent ) );
					break;

				case 'ph':

					console.warn( 'polygon holes not yet supported!' );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Polylist () {

		Polygons.call( this );

		this.vcount = [];

	};

	Polylist.prototype = Object.create( Polygons.prototype );

	function Triangles () {

		Polygons.call( this );

		this.vcount = 3;

	};

	Triangles.prototype = Object.create( Polygons.prototype );

	function Accessor() {

		this.source = "";
		this.count = 0;
		this.stride = 0;
		this.params = [];

	};

	Accessor.prototype.parse = function ( element ) {

		this.params = [];
		this.source = element.getAttribute( 'source' );
		this.count = _attr_as_int( element, 'count', 0 );
		this.stride = _attr_as_int( element, 'stride', 0 );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeName == 'param' ) {

				var param = {};
				param[ 'name' ] = child.getAttribute( 'name' );
				param[ 'type' ] = child.getAttribute( 'type' );
				this.params.push( param );

			}

		}

		return this;

	};

	function Vertices() {

		this.input = {};

	};

	Vertices.prototype.parse = function ( element ) {

		this.id = element.getAttribute('id');

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[i].nodeName == 'input' ) {

				var input = ( new Input() ).parse( element.childNodes[ i ] );
				this.input[ input.semantic ] = input;

			}

		}

		return this;

	};

	function Input () {

		this.semantic = "";
		this.offset = 0;
		this.source = "";
		this.set = 0;

	};

	Input.prototype.parse = function ( element ) {

		this.semantic = element.getAttribute('semantic');
		this.source = element.getAttribute('source').replace(/^#/, '');
		this.set = _attr_as_int(element, 'set', -1);
		this.offset = _attr_as_int(element, 'offset', 0);

		if ( this.semantic == 'TEXCOORD' && this.set < 0 ) {

			this.set = 0;

		}

		return this;

	};

	function Source ( id ) {

		this.id = id;
		this.type = null;

	};

	Source.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];

			switch ( child.nodeName ) {

				case 'bool_array':

					this.data = _bools( child.textContent );
					this.type = child.nodeName;
					break;

				case 'float_array':

					this.data = _floats( child.textContent );
					this.type = child.nodeName;
					break;

				case 'int_array':

					this.data = _ints( child.textContent );
					this.type = child.nodeName;
					break;

				case 'IDREF_array':
				case 'Name_array':

					this.data = _strings( child.textContent );
					this.type = child.nodeName;
					break;

				case 'technique_common':

					for ( var j = 0; j < child.childNodes.length; j ++ ) {

						if ( child.childNodes[ j ].nodeName == 'accessor' ) {

							this.accessor = ( new Accessor() ).parse( child.childNodes[ j ] );
							break;

						}
					}
					break;

				default:
					// console.log(child.nodeName);
					break;

			}

		}

		return this;

	};

	Source.prototype.read = function () {

		var result = [];

		//for (var i = 0; i < this.accessor.params.length; i++) {

			var param = this.accessor.params[ 0 ];

			//console.log(param.name + " " + param.type);

			switch ( param.type ) {

				case 'IDREF':
				case 'Name': case 'name':
				case 'float':

					return this.data;

				case 'float4x4':

					for ( var j = 0; j < this.data.length; j += 16 ) {

						var s = this.data.slice( j, j + 16 );
						var m = getConvertedMat4( s );
						result.push( m );
					}

					break;

				default:

					console.log( 'ColladaLoader: Source: Read dont know how to read ' + param.type + '.' );
					break;

			}

		//}

		return result;

	};

	function Material () {

		this.id = "";
		this.name = "";
		this.instance_effect = null;

	};

	Material.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName == 'instance_effect' ) {

				this.instance_effect = ( new InstanceEffect() ).parse( element.childNodes[ i ] );
				break;

			}

		}

		return this;

	};

	function ColorOrTexture () {

		this.color = new THREE.Color( 0 );
		this.color.setRGB( Math.random(), Math.random(), Math.random() );
		this.color.a = 1.0;

		this.texture = null;
		this.texcoord = null;
		this.texOpts = null;

	};

	ColorOrTexture.prototype.isColor = function () {

		return ( this.texture == null );

	};

	ColorOrTexture.prototype.isTexture = function () {

		return ( this.texture != null );

	};

	ColorOrTexture.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'color':

					var rgba = _floats( child.textContent );
					this.color = new THREE.Color(0);
					this.color.setRGB( rgba[0], rgba[1], rgba[2] );
					this.color.a = rgba[3];
					break;

				case 'texture':

					this.texture = child.getAttribute('texture');
					this.texcoord = child.getAttribute('texcoord');
					// Defaults from:
					// https://collada.org/mediawiki/index.php/Maya_texture_placement_MAYA_extension
					this.texOpts = {
						offsetU: 0,
						offsetV: 0,
						repeatU: 1,
						repeatV: 1,
						wrapU: 1,
						wrapV: 1,
					};
					this.parseTexture( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	ColorOrTexture.prototype.parseTexture = function ( element ) {

		if ( ! element.childNodes ) return this;

		// This should be supported by Maya, 3dsMax, and MotionBuilder

		if ( element.childNodes[1] && element.childNodes[1].nodeName === 'extra' ) {

			element = element.childNodes[1];

			if ( element.childNodes[1] && element.childNodes[1].nodeName === 'technique' ) {

				element = element.childNodes[1];

			}

		}

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			switch ( child.nodeName ) {

				case 'offsetU':
				case 'offsetV':
				case 'repeatU':
				case 'repeatV':

					this.texOpts[ child.nodeName ] = parseFloat( child.textContent );
					break;

				case 'wrapU':
				case 'wrapV':

					this.texOpts[ child.nodeName ] = parseInt( child.textContent );
					break;

				default:
					this.texOpts[ child.nodeName ] = child.textContent;
					break;

			}

		}

		return this;

	};

	function Shader ( type, effect ) {

		this.type = type;
		this.effect = effect;
		this.material = null;

	};

	Shader.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'ambient':
				case 'emission':
				case 'diffuse':
				case 'specular':
				case 'transparent':

					this[ child.nodeName ] = ( new ColorOrTexture() ).parse( child );
					break;

				case 'shininess':
				case 'reflectivity':
				case 'index_of_refraction':
				case 'transparency':

					var f = evaluateXPath( child, './/dae:float' );

					if ( f.length > 0 )
						this[ child.nodeName ] = parseFloat( f[ 0 ].textContent );

					break;

				default:
					break;

			}

		}

		this.create();
		return this;

	};

	Shader.prototype.create = function() {

		var props = {};
		var transparent = ( this['transparency'] !== undefined && this['transparency'] < 1.0 );

		for ( var prop in this ) {

			switch ( prop ) {

				case 'ambient':
				case 'emission':
				case 'diffuse':
				case 'specular':

					var cot = this[ prop ];

					if ( cot instanceof ColorOrTexture ) {

						if ( cot.isTexture() ) {

							var samplerId = cot.texture;
							var surfaceId = this.effect.sampler[samplerId].source;

							if ( surfaceId ) {

								var surface = this.effect.surface[surfaceId];
								var image = images[surface.init_from];

								if (image) {

									var texture = THREE.ImageUtils.loadTexture(baseUrl + image.init_from);
									texture.wrapS = cot.texOpts.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
									texture.wrapT = cot.texOpts.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
									texture.offset.x = cot.texOpts.offsetU;
									texture.offset.y = cot.texOpts.offsetV;
									texture.repeat.x = cot.texOpts.repeatU;
									texture.repeat.y = cot.texOpts.repeatV;
									props['map'] = texture;

									// Texture with baked lighting?
									if (prop === 'emission') props['emissive'] = 0xffffff;

								}

							}

						} else if ( prop === 'diffuse' || !transparent ) {

							if ( prop === 'emission' ) {

								props[ 'emissive' ] = cot.color.getHex();

							} else {

								props[ prop ] = cot.color.getHex();

							}

						}

					}

					break;

				case 'shininess':

					props[ prop ] = this[ prop ];
					break;

				case 'reflectivity':

					props[ prop ] = this[ prop ];
					if( props[ prop ] > 0.0 ) props['envMap'] = options.defaultEnvMap;
					props['combine'] = THREE.MixOperation;	//mix regular shading with reflective component
					break;

				case 'index_of_refraction':

					props[ 'refractionRatio' ] = this[ prop ]; //TODO: "index_of_refraction" becomes "refractionRatio" in shader, but I'm not sure if the two are actually comparable
					if ( this[ prop ] !== 1.0 ) props['envMap'] = options.defaultEnvMap;
					break;

				case 'transparency':

					if ( transparent ) {

						props[ 'transparent' ] = true;
						props[ 'opacity' ] = this[ prop ];
						transparent = true;

					}

					break;

				default:
					break;

			}

		}

		props[ 'shading' ] = preferredShading;
		props[ 'side' ] = this.effect.doubleSided ? THREE.DoubleSide : THREE.FrontSide;

		switch ( this.type ) {

			case 'constant':

				if (props.emissive != undefined) props.color = props.emissive;
				this.material = new THREE.MeshBasicMaterial( props );
				break;

			case 'phong':
			case 'blinn':

				if (props.diffuse != undefined) props.color = props.diffuse;
				this.material = new THREE.MeshPhongMaterial( props );
				break;

			case 'lambert':
			default:

				if (props.diffuse != undefined) props.color = props.diffuse;
				this.material = new THREE.MeshLambertMaterial( props );
				break;

		}

		return this.material;

	};

	function Surface ( effect ) {

		this.effect = effect;
		this.init_from = null;
		this.format = null;

	};

	Surface.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'init_from':

					this.init_from = child.textContent;
					break;

				case 'format':

					this.format = child.textContent;
					break;

				default:

					console.log( "unhandled Surface prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Sampler2D ( effect ) {

		this.effect = effect;
		this.source = null;
		this.wrap_s = null;
		this.wrap_t = null;
		this.minfilter = null;
		this.magfilter = null;
		this.mipfilter = null;

	};

	Sampler2D.prototype.parse = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'source':

					this.source = child.textContent;
					break;

				case 'minfilter':

					this.minfilter = child.textContent;
					break;

				case 'magfilter':

					this.magfilter = child.textContent;
					break;

				case 'mipfilter':

					this.mipfilter = child.textContent;
					break;

				case 'wrap_s':

					this.wrap_s = child.textContent;
					break;

				case 'wrap_t':

					this.wrap_t = child.textContent;
					break;

				default:

					console.log( "unhandled Sampler2D prop: " + child.nodeName );
					break;

			}

		}

		return this;

	};

	function Effect () {

		this.id = "";
		this.name = "";
		this.shader = null;
		this.surface = {};
		this.sampler = {};

	};

	Effect.prototype.create = function () {

		if ( this.shader == null ) {

			return null;

		}

	};

	Effect.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		extractDoubleSided( this, element );

		this.shader = null;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseTechnique( this.parseProfileCOMMON( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Effect.prototype.parseNewparam = function ( element ) {

		var sid = element.getAttribute( 'sid' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'surface':

					this.surface[sid] = ( new Surface( this ) ).parse( child );
					break;

				case 'sampler2D':

					this.sampler[sid] = ( new Sampler2D( this ) ).parse( child );
					break;

				case 'extra':

					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

	};

	Effect.prototype.parseProfileCOMMON = function ( element ) {

		var technique;

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'profile_COMMON':

					this.parseProfileCOMMON( child );
					break;

				case 'technique':

					technique = child;
					break;

				case 'newparam':

					this.parseNewparam( child );
					break;

				case 'image':

					var _image = ( new _Image() ).parse( child );
					images[ _image.id ] = _image;
					break;

				case 'extra':
					break;

				default:

					console.log( child.nodeName );
					break;

			}

		}

		return technique;

	};

	Effect.prototype.parseTechnique= function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[i];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'constant':
				case 'lambert':
				case 'blinn':
				case 'phong':

					this.shader = ( new Shader( child.nodeName, this ) ).parse( child );
					break;

				default:
					break;

			}

		}

	};

	function InstanceEffect () {

		this.url = "";

	};

	InstanceEffect.prototype.parse = function ( element ) {

		this.url = element.getAttribute( 'url' ).replace( /^#/, '' );
		return this;

	};

	function Animation() {

		this.id = "";
		this.name = "";
		this.source = {};
		this.sampler = [];
		this.channel = [];

	};

	Animation.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );
		this.source = {};

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];

			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'animation':

					var anim = ( new Animation() ).parse( child );

					for ( var src in anim.source ) {

						this.source[ src ] = anim.source[ src ];

					}

					for ( var j = 0; j < anim.channel.length; j ++ ) {

						this.channel.push( anim.channel[ j ] );
						this.sampler.push( anim.sampler[ j ] );

					}

					break;

				case 'source':

					var src = ( new Source() ).parse( child );
					this.source[ src.id ] = src;
					break;

				case 'sampler':

					this.sampler.push( ( new Sampler( this ) ).parse( child ) );
					break;

				case 'channel':

					this.channel.push( ( new Channel( this ) ).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	function Channel( animation ) {

		this.animation = animation;
		this.source = "";
		this.target = "";
		this.fullSid = null;
		this.sid = null;
		this.dotSyntax = null;
		this.arrSyntax = null;
		this.arrIndices = null;
		this.member = null;

	};

	Channel.prototype.parse = function ( element ) {

		this.source = element.getAttribute( 'source' ).replace( /^#/, '' );
		this.target = element.getAttribute( 'target' );

		var parts = this.target.split( '/' );

		var id = parts.shift();
		var sid = parts.shift();

		var dotSyntax = ( sid.indexOf(".") >= 0 );
		var arrSyntax = ( sid.indexOf("(") >= 0 );

		if ( dotSyntax ) {

			parts = sid.split(".");
			this.sid = parts.shift();
			this.member = parts.shift();

		} else if ( arrSyntax ) {

			var arrIndices = sid.split("(");
			this.sid = arrIndices.shift();

			for (var j = 0; j < arrIndices.length; j ++ ) {

				arrIndices[j] = parseInt( arrIndices[j].replace(/\)/, '') );

			}

			this.arrIndices = arrIndices;

		} else {

			this.sid = sid;

		}

		this.fullSid = sid;
		this.dotSyntax = dotSyntax;
		this.arrSyntax = arrSyntax;

		return this;

	};

	function Sampler ( animation ) {

		this.id = "";
		this.animation = animation;
		this.inputs = [];
		this.input = null;
		this.output = null;
		this.strideOut = null;
		this.interpolation = null;
		this.startTime = null;
		this.endTime = null;
		this.duration = 0;

	};

	Sampler.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.inputs = [];

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'input':

					this.inputs.push( (new Input()).parse( child ) );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Sampler.prototype.create = function () {

		for ( var i = 0; i < this.inputs.length; i ++ ) {

			var input = this.inputs[ i ];
			var source = this.animation.source[ input.source ];

			switch ( input.semantic ) {

				case 'INPUT':

					this.input = source.read();
					break;

				case 'OUTPUT':

					this.output = source.read();
					this.strideOut = source.accessor.stride;
					break;

				case 'INTERPOLATION':

					this.interpolation = source.read();
					break;

				case 'IN_TANGENT':

					break;

				case 'OUT_TANGENT':

					break;

				default:

					console.log(input.semantic);
					break;

			}

		}

		this.startTime = 0;
		this.endTime = 0;
		this.duration = 0;

		if ( this.input.length ) {

			this.startTime = 100000000;
			this.endTime = -100000000;

			for ( var i = 0; i < this.input.length; i ++ ) {

				this.startTime = Math.min( this.startTime, this.input[ i ] );
				this.endTime = Math.max( this.endTime, this.input[ i ] );

			}

			this.duration = this.endTime - this.startTime;

		}

	};

	Sampler.prototype.getData = function ( type, ndx ) {

		var data;

		if ( type === 'matrix' && this.strideOut === 16 ) {

			data = this.output[ ndx ];

		} else if ( this.strideOut > 1 ) {

			data = [];
			ndx *= this.strideOut;

			for ( var i = 0; i < this.strideOut; ++i ) {

				data[ i ] = this.output[ ndx + i ];

			}

			if ( this.strideOut === 3 ) {

				switch ( type ) {

					case 'rotate':
					case 'translate':

						fixCoords( data, -1 );
						break;

					case 'scale':

						fixCoords( data, 1 );
						break;

				}

			} else if ( this.strideOut === 4 && type === 'matrix' ) {

				fixCoords( data, -1 );

			}

		} else {

			data = this.output[ ndx ];

		}

		return data;

	};

	function Key ( time ) {

		this.targets = [];
		this.time = time;

	};

	Key.prototype.addTarget = function ( fullSid, transform, member, data ) {

		this.targets.push( {
			sid: fullSid,
			member: member,
			transform: transform,
			data: data
		} );

	};

	Key.prototype.apply = function ( opt_sid ) {

		for ( var i = 0; i < this.targets.length; ++i ) {

			var target = this.targets[ i ];

			if ( !opt_sid || target.sid === opt_sid ) {

				target.transform.update( target.data, target.member );

			}

		}

	};

	Key.prototype.getTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return this.targets[ i ];

			}

		}

		return null;

	};

	Key.prototype.hasTarget = function ( fullSid ) {

		for ( var i = 0; i < this.targets.length; ++i ) {

			if ( this.targets[ i ].sid === fullSid ) {

				return true;

			}

		}

		return false;

	};

	// TODO: Currently only doing linear interpolation. Should support full COLLADA spec.
	Key.prototype.interpolate = function ( nextKey, time ) {

		for ( var i = 0; i < this.targets.length; ++i ) {

			var target = this.targets[ i ],
				nextTarget = nextKey.getTarget( target.sid ),
				data;

			if ( target.transform.type !== 'matrix' && nextTarget ) {

				var scale = ( time - this.time ) / ( nextKey.time - this.time ),
					nextData = nextTarget.data,
					prevData = target.data;

				// check scale error

				if ( scale < 0 || scale > 1 ) {

					console.log( "Key.interpolate: Warning! Scale out of bounds:" + scale );
					scale = scale < 0 ? 0 : 1;

				}

				if ( prevData.length ) {

					data = [];

					for ( var j = 0; j < prevData.length; ++j ) {

						data[ j ] = prevData[ j ] + ( nextData[ j ] - prevData[ j ] ) * scale;

					}

				} else {

					data = prevData + ( nextData - prevData ) * scale;

				}

			} else {

				data = target.data;

			}

			target.transform.update( data, target.member );

		}

	};

	function Camera() {

		this.id = "";
		this.name = "";
		this.technique = "";

	};

	Camera.prototype.parse = function ( element ) {

		this.id = element.getAttribute( 'id' );
		this.name = element.getAttribute( 'name' );

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			var child = element.childNodes[ i ];
			if ( child.nodeType != 1 ) continue;

			switch ( child.nodeName ) {

				case 'optics':

					this.parseOptics( child );
					break;

				default:
					break;

			}

		}

		return this;

	};

	Camera.prototype.parseOptics = function ( element ) {

		for ( var i = 0; i < element.childNodes.length; i ++ ) {

			if ( element.childNodes[ i ].nodeName == 'technique_common' ) {

				var technique = element.childNodes[ i ];

				for ( var j = 0; j < technique.childNodes.length; j ++ ) {

					this.technique = technique.childNodes[ j ].nodeName;

					if ( this.technique == 'perspective' ) {

						var perspective = technique.childNodes[ j ];

						for ( var k = 0; k < perspective.childNodes.length; k ++ ) {

							var param = perspective.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'yfov':
									this.yfov = param.textContent;
									break;
								case 'xfov':
									this.xfov = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					} else if ( this.technique == 'orthographic' ) {

						var orthographic = technique.childNodes[ j ];

						for ( var k = 0; k < orthographic.childNodes.length; k ++ ) {

							var param = orthographic.childNodes[ k ];

							switch ( param.nodeName ) {

								case 'xmag':
									this.xmag = param.textContent;
									break;
								case 'ymag':
									this.ymag = param.textContent;
									break;
								case 'znear':
									this.znear = param.textContent;
									break;
								case 'zfar':
									this.zfar = param.textContent;
									break;
								case 'aspect_ratio':
									this.aspect_ratio = param.textContent;
									break;

							}

						}

					}

				}

			}

		}

		return this;

	};

	function InstanceCamera() {

		this.url = "";

	};

	InstanceCamera.prototype.parse = function ( element ) {

		this.url = element.getAttribute('url').replace(/^#/, '');

		return this;

	};

	function _source( element ) {

		var id = element.getAttribute( 'id' );

		if ( sources[ id ] != undefined ) {

			return sources[ id ];

		}

		sources[ id ] = ( new Source(id )).parse( element );
		return sources[ id ];

	};

	function _nsResolver( nsPrefix ) {

		if ( nsPrefix == "dae" ) {

			return "http://www.collada.org/2005/11/COLLADASchema";

		}

		return null;

	};

	function _bools( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( (raw[i] == 'true' || raw[i] == '1') ? true : false );

		}

		return data;

	};

	function _floats( str ) {

		var raw = _strings(str);
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseFloat( raw[ i ] ) );

		}

		return data;

	};

	function _ints( str ) {

		var raw = _strings( str );
		var data = [];

		for ( var i = 0, l = raw.length; i < l; i ++ ) {

			data.push( parseInt( raw[ i ], 10 ) );

		}

		return data;

	};

	function _strings( str ) {

		return ( str.length > 0 ) ? _trimString( str ).split( /\s+/ ) : [];

	};

	function _trimString( str ) {

		return str.replace( /^\s+/, "" ).replace( /\s+$/, "" );

	};

	function _attr_as_float( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseFloat( element.getAttribute( name ) );

		} else {

			return defaultValue;

		}

	};

	function _attr_as_int( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return parseInt( element.getAttribute( name ), 10) ;

		} else {

			return defaultValue;

		}

	};

	function _attr_as_string( element, name, defaultValue ) {

		if ( element.hasAttribute( name ) ) {

			return element.getAttribute( name );

		} else {

			return defaultValue;

		}

	};

	function _format_float( f, num ) {

		if ( f === undefined ) {

			var s = '0.';

			while ( s.length < num + 2 ) {

				s += '0';

			}

			return s;

		}

		num = num || 2;

		var parts = f.toString().split( '.' );
		parts[ 1 ] = parts.length > 1 ? parts[ 1 ].substr( 0, num ) : "0";

		while( parts[ 1 ].length < num ) {

			parts[ 1 ] += '0';

		}

		return parts.join( '.' );

	};

	function evaluateXPath( node, query ) {

		var instances = COLLADA.evaluate( query, node, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

		var inst = instances.iterateNext();
		var result = [];

		while ( inst ) {

			result.push( inst );
			inst = instances.iterateNext();

		}

		return result;

	};

	function extractDoubleSided( obj, element ) {

		obj.doubleSided = false;

		var node = COLLADA.evaluate( './/dae:extra//dae:double_sided', element, _nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null );

		if ( node ) {

			node = node.iterateNext();

			if ( node && parseInt( node.textContent, 10 ) === 1 ) {

				obj.doubleSided = true;

			}

		}

	};

	// Up axis conversion

	function setUpConversion() {

		if ( !options.convertUpAxis || colladaUp === options.upAxis ) {

			upConversion = null;

		} else {

			switch ( colladaUp ) {

				case 'X':

					upConversion = options.upAxis === 'Y' ? 'XtoY' : 'XtoZ';
					break;

				case 'Y':

					upConversion = options.upAxis === 'X' ? 'YtoX' : 'YtoZ';
					break;

				case 'Z':

					upConversion = options.upAxis === 'X' ? 'ZtoX' : 'ZtoY';
					break;

			}

		}

	};

	function fixCoords( data, sign ) {

		if ( !options.convertUpAxis || colladaUp === options.upAxis ) {

			return;

		}

		switch ( upConversion ) {

			case 'XtoY':

				var tmp = data[ 0 ];
				data[ 0 ] = sign * data[ 1 ];
				data[ 1 ] = tmp;
				break;

			case 'XtoZ':

				var tmp = data[ 2 ];
				data[ 2 ] = data[ 1 ];
				data[ 1 ] = data[ 0 ];
				data[ 0 ] = tmp;
				break;

			case 'YtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = sign * tmp;
				break;

			case 'YtoZ':

				var tmp = data[ 1 ];
				data[ 1 ] = sign * data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoX':

				var tmp = data[ 0 ];
				data[ 0 ] = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = tmp;
				break;

			case 'ZtoY':

				var tmp = data[ 1 ];
				data[ 1 ] = data[ 2 ];
				data[ 2 ] = sign * tmp;
				break;

		}

	};

	function getConvertedVec3( data, offset ) {

		var arr = [ data[ offset ], data[ offset + 1 ], data[ offset + 2 ] ];
		fixCoords( arr, -1 );
		return new THREE.Vector3( arr[ 0 ], arr[ 1 ], arr[ 2 ] );

	};

	function getConvertedMat4( data ) {

		if ( options.convertUpAxis ) {

			// First fix rotation and scale

			// Columns first
			var arr = [ data[ 0 ], data[ 4 ], data[ 8 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 4 ] = arr[ 1 ];
			data[ 8 ] = arr[ 2 ];
			arr = [ data[ 1 ], data[ 5 ], data[ 9 ] ];
			fixCoords( arr, -1 );
			data[ 1 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 9 ] = arr[ 2 ];
			arr = [ data[ 2 ], data[ 6 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 2 ] = arr[ 0 ];
			data[ 6 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];
			// Rows second
			arr = [ data[ 0 ], data[ 1 ], data[ 2 ] ];
			fixCoords( arr, -1 );
			data[ 0 ] = arr[ 0 ];
			data[ 1 ] = arr[ 1 ];
			data[ 2 ] = arr[ 2 ];
			arr = [ data[ 4 ], data[ 5 ], data[ 6 ] ];
			fixCoords( arr, -1 );
			data[ 4 ] = arr[ 0 ];
			data[ 5 ] = arr[ 1 ];
			data[ 6 ] = arr[ 2 ];
			arr = [ data[ 8 ], data[ 9 ], data[ 10 ] ];
			fixCoords( arr, -1 );
			data[ 8 ] = arr[ 0 ];
			data[ 9 ] = arr[ 1 ];
			data[ 10 ] = arr[ 2 ];

			// Now fix translation
			arr = [ data[ 3 ], data[ 7 ], data[ 11 ] ];
			fixCoords( arr, -1 );
			data[ 3 ] = arr[ 0 ];
			data[ 7 ] = arr[ 1 ];
			data[ 11 ] = arr[ 2 ];

		}

		return new THREE.Matrix4(
			data[0], data[1], data[2], data[3],
			data[4], data[5], data[6], data[7],
			data[8], data[9], data[10], data[11],
			data[12], data[13], data[14], data[15]
			);

	};

	function getConvertedIndex( index ) {

		if ( index > -1 && index < 3 ) {

			var members = ['X', 'Y', 'Z'],
				indices = { X: 0, Y: 1, Z: 2 };

			index = getConvertedMember( members[ index ] );
			index = indices[ index ];

		}

		return index;

	};

	function getConvertedMember( member ) {

		if ( options.convertUpAxis ) {

			switch ( member ) {

				case 'X':

					switch ( upConversion ) {

						case 'XtoY':
						case 'XtoZ':
						case 'YtoX':

							member = 'Y';
							break;

						case 'ZtoX':

							member = 'Z';
							break;

					}

					break;

				case 'Y':

					switch ( upConversion ) {

						case 'XtoY':
						case 'YtoX':
						case 'ZtoX':

							member = 'X';
							break;

						case 'XtoZ':
						case 'YtoZ':
						case 'ZtoY':

							member = 'Z';
							break;

					}

					break;

				case 'Z':

					switch ( upConversion ) {

						case 'XtoZ':

							member = 'X';
							break;

						case 'YtoZ':
						case 'ZtoX':
						case 'ZtoY':

							member = 'Y';
							break;

					}

					break;

			}

		}

		return member;

	};

	return {

		load: load,
		parse: parse,
		setPreferredShading: setPreferredShading,
		applySkin: applySkin,
		geometries : geometries,
		options: options

	};

};
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
}/*
 * daycount.js v0.1.6
 * http://yellowseed.org/daycount.js/
 *
 * Copyright 2011, Joshua Tacoma
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

// All other globals defined here are kept in this object:
var daycount = ( typeof exports !== 'undefined' && exports !== null ) ? exports : {};

// The 'moment' type, which may include associated information from any
// calendar system:
daycount.moment = (function() {

  // 'moment' constructor:
  function moment(arg) {
    this.set(arg);
  };

  moment.prototype.set = function(arg) {
    if(!arg || arg === null)
      arg = new Date();

    // Now, we're going to calculate as many counts as possible...

    // 'todo' lists counts to be calculated:
    var todo = []
    for(var name in daycount.counts)
    {
      todo.push(name);
      // wipe out any counts lingering from previous calculations:
      if(name in this)
        delete this[name];
    }

    // 'done' lists known counts:
    var done = [arg.constructor.name];
    // TODO: make sure that no item in 'done' is also in 'todo'.

    if (!(arg.constructor.name in daycount.counts))
      this.isUnknown = true;

    // Store argument as the only known property of this:
    this[arg.constructor.name] = arg;

    // Iterate through counts in 'done'.  We're going to add to this list as we
    // go, which makes this for loop a little more interesting:
    for (var indexDone = 0;
         indexDone < done.length && todo.length > 0;
         ++indexDone)
    {
      var nameDone = done[indexDone];
      var builderNameTodo = 'from_' + nameDone;

      // Iterate through counts in 'todo'.  Since we're going to remove
      // them as we go, iterate backwards to keep remaining indices
      // from shifting:
      for (var indexTodo = todo.length - 1; indexTodo >= 0; --indexTodo) {
        var nameTodo = todo[indexTodo];
        var countTodo = daycount.counts[nameTodo];

        if(!countTodo.hasOwnProperty(builderNameTodo)) continue;

        // Found one!  Calculate the value for 'countTodo':
        var builder = countTodo[builderNameTodo];
        var built = builder(this[nameDone]);
        if(built === null) continue;

        this[nameTodo] = built;
        done.push(nameTodo);
        todo.splice(indexTodo, 1)
        if('isUnknown' in this)
          delete this['isUnknown'];
      }
    }
  };

  moment.prototype.plusEarthSolarDays = function(days) {
    if('localJulianDay' in this)
      return new moment(
        new daycount.counts.localJulianDay(
          this.localJulianDay.number + days));
    else
      throw 'this moment has no counts that support the specified increment.';
  };

  moment.prototype.plus = moment.prototype.plusEarthSolarDays;

  return moment;
})();

// A collection of counts i.e. calendar systems.
// Each calendar system should be added to this object.
daycount.counts = {};

daycount.version_ = {
  major: 0,
  minor: 1,
  build: 6,
};

daycount.counts.badi = (function() {

  var epoch_jd = 2394647; // 1844-03-21

  function badi(arg) {
    this.major = parseInt(arg && arg.major);
    this.cycle = parseInt(arg && arg.cycle);
    this.year = parseInt(arg && arg.year);
    this.dayOfYear = parseInt(arg && arg.dayOfYear);
    this.isLeapYear = parseInt(arg && arg.isLeapYear);
    var intercalaryStart = 336;
    var intercalaryEnd = 336 + (this.isLeapYear ? 6 : 5);
    this.isIntercalary = intercalaryStart <= this.dayOfYear
                      && this.dayOfYear < intercalaryEnd;
    this.month = this.isIntercalary ? NaN
      : (this.dayOfYear >= intercalaryEnd) ? 19
      : Math.floor((this.dayOfYear - 1) / 19) + 1;
    this.dayOfMonth = this.isIntercalary ? NaN
      : (this.isLeapYear && this.month == 19)
      ? this.dayOfYear - intercalaryEnd
      : (this.dayOfYear - 1) % 19 + 1;
    //this.dayOfWeek = ?
  };

  badi.prototype.toString = function() {
    return this.major + ':' + this.cycle + ':' + this.year +
      ':' + this.dayOfYear;
  };

  badi.from_gregorian = function(gregorian) {
    var isLeapYear = gregorian.isLeapYear
      ? (gregorian.month < 3 ||
         (gregorian.month == 3 && gregorian.dayOfMonth < 21))
      : new daycount.counts.gregorian(
          { year: gregorian.year + 1, month: 1, dayOfMonth: 1}).isLeapYear;
    var dayOfYear = gregorian.countDaysSince(
        { year: gregorian.year, month: 3, dayOfMonth: 20});
    if (dayOfYear <= 0) dayOfYear += isLeapYear ? 366 : 365;
    var year = gregorian.year - ((dayOfYear > 286) ? 1845 : 1844);
    if (year >= 0) year += 1;
    var major = Math.floor((year - 1) / (19 * 19));
    if (major >= 0) major += 1;
    var cycle = Math.floor((year - 1) / 19);
    if (cycle >= 0) cycle += 1;
    return new daycount.counts.badi({
      major: major,
      cycle: cycle,
      year: year,
      dayOfYear: dayOfYear,
      isLeapYear: isLeapYear,
    });
  };

  badi.pattern = /(\d+):(\d+):(\d+):(\d+)/;

  badi.from_String = function(string) {
    var match = (badi.pattern).exec(string);
    if (!match) return null;
    return new daycount.counts.badi({
      major: parseInt(match[1]),
      cycle: parseInt(match[2]),
      year: parseInt(match[3]),
      dayOfYear: parseInt(match[4]),
    });
  };

  return badi;
})();
// Dates in the Chinese calendar are difficult to calculate without certain
// hard-to-find information.  For now, this algorithm calculates only the year,
// and only for dates when such a simple algorithm is reliable.  For other
// dates, it will determine 'stem' and 'branch' numbers as NaN.
// TODO: Find the necessary information and replace this algorithm with
// something more complete.
daycount.counts.chineseYear = (function() {
  function chineseYear (arg) {
    this.stem = parseInt(arg && arg.stem);
    this.branch = parseInt(arg && arg.branch);
  }
  chineseYear.prototype.toString = function() {
    return (this.stem || '?') + '/' + (this.branch || '?');
  };
  chineseYear.from_gregorian = function(gregorian) {
    if (gregorian.month <= 2)
      return new chineseYear({stem:NaN,branch:NaN});
    var year0 = ((gregorian.year - 2044 % 60) + 60) % 60;
    var stem = (year0 % 10) + 1;
    var branch = (year0 % 12) + 1;
    return new chineseYear({stem:stem,branch:branch});
  };
  return chineseYear;
})();
daycount.counts.dreamspell = (function () {

  function dreamspell (arg) {
    this.month = parseInt(arg && arg.month);
    this.dayOfMonth = parseInt(arg && arg.dayOfMonth);
    this.dayOfYear = isNaN(this.month) ? 0
      : (this.month - 1) * 28 + this.dayOfMonth;
    this.kin = parseInt(arg && arg.kin);
  };

  var reference = {
    gregorian: { year: 2012, month: 12, dayOfMonth: 21 },
    dreamspell: { month: 6, dayOfMonth: 9, kin: 207 },
  };

  function plusDays (dreamspell, days) {
    var dayOfYear = (dreamspell.dayOfYear + 365 + (days % 365)) % 365;
    var month = NaN;
    var dayOfMonth = NaN;
    if (dayOfYear != 0)
    {
      month = Math.ceil(dayOfYear / 28);
      dayOfMonth = dayOfYear - ((month - 1) * 28);
    }
    var kin = isNaN(dreamspell.kin) ? NaN
      : (dreamspell.kin + (days % 260) + 259) % 260 + 1;
    return new daycount.counts.dreamspell({
      month: month,
      dayOfMonth: dayOfMonth,
      kin: kin,
    });
  };

  dreamspell.from_gregorian = function (gregorian) {
    if (reference.dreamspell.constructor !== dreamspell)
      reference.dreamspell = new dreamspell(reference.dreamspell);
    var allDays = gregorian.countDaysSince(reference.gregorian);
    var leapDays = gregorian.countLeapDaysSince(reference.gregorian);
    return plusDays(reference.dreamspell, allDays - leapDays);
  };

  dreamspell.localized = {};

  dreamspell.prototype.monthName = function() {
    return dreamspell.localized.monthNames[this.month - 1];
  };

  dreamspell.prototype.kinToneName = function() {
    return dreamspell.localized.kinToneNames[this.kin % 13];
  };

  dreamspell.prototype.kinSealName = function() {
    return dreamspell.localized.kinSealNames[this.kin % 20];
  };

  dreamspell.prototype.kinColorName = function() {
    return dreamspell.localized.kinColorNames[this.kin % 4];
  };

  dreamspell.prototype.toString = function() {
    return (isNaN(this.month) ? 'x' : this.month)
      + '.' + (isNaN(this.dayOfMonth) ? 'x' : this.dayOfMonth)
      + '.' + (isNaN(this.kin) ? 'x' : this.kin)
  };

  return dreamspell;
})();
daycount.counts.dreamspell.localized.monthNames = [
  "Magnetic", "Lunar", "Electric", "Self-Existing", "Overtone", "Rhythmic",
  "Resonant", "Galactic", "Solar", "Spectral", "Planetary", "Crystal",
  "Cosmic"
];

daycount.counts.dreamspell.localized.kinToneNames = [
  "Cosmic",
  "Magnetic", "Lunar", "Electric", "Self-Existing", "Overtone", "Rhythmic",
  "Resonant", "Galactic", "Solar", "Spectral", "Planetary", "Crystal"
];

daycount.counts.dreamspell.localized.kinSealNames = [
  "Sun", "Dragon", "Wind", "Night", "Seed", "Serpent", "World-Bridger",
  "Hand", "Star", "Moon", "Dog", "Monkey", "Human", "Skywalker", "Wizard",
  "Eagle", "Warrior", "Earth", "Mirror", "Storm"
];

daycount.counts.dreamspell.localized.kinColorNames = [
  "Yellow", "Red", "White", "Blue"
];
daycount.counts.gregorian = (function() {

  var dayOfYear = [0,31,28,31,30,31,30,31,31,30,31,30,31];
  for(var i = 1; i < dayOfYear.length; ++i)
    dayOfYear[i] += dayOfYear[i-1];
  var friday = { year: 2012, month: 12, dayOfMonth: 21 };

  function gregorian(arg) {
    this.year = parseInt(arg && arg.year);
    this.month = parseInt(arg && arg.month);
    this.dayOfMonth = parseInt(arg && arg.dayOfMonth);
    this.isLeapYear =
      (!(this.year % 4) && (this.year % 100) || !(this.year % 400)) != 0;
    this.isLeapDay =
      this.isLeapYear && (this.month == 2) && (this.dayOfMonth == 29);
    this.dayOfYear = dayOfYear[this.month - 1]
      + this.dayOfMonth + ((this.isLeapYear && this.month > 2) ? 1 : 0);
    var a = Math.floor((14 - this.month) / 12);
    var y = this.year - a;
    var m = this.month + 12 * a - 2;
    this.dayOfWeek = ((this.dayOfMonth + y + Math.floor(y / 4)
      - Math.floor(y / 100) + Math.floor(y / 400) + Math.floor(31 * m / 12))
      % 7 + 7) % 7 + 1;
  };

  gregorian.prototype.countDaysSince = function (other) {
    var other = (other.constructor === gregorian)
      ? other : new gregorian(other);
    var leaps = new gregorian(
      { year: other.year, month: 1, dayOfMonth: 1 })
      .countLeapDaysSince(new gregorian(
        { year: this.year, month: 1, dayOfMonth: 1 }));
    return (this.year - other.year) * 365
      + this.dayOfYear - other.dayOfYear
      - leaps;
  };

  gregorian.prototype.countLeapDaysSince = function(other) {
    other = (other.constructor === gregorian)
      ? other : new gregorian(other);
    other_leaps = Math.floor(other.year / 4) - Math.floor(other.year / 100)
      + Math.floor(other.year / 400);
    if (other.isLeapYear && other.month <= 2)
      other_leaps -= 1;
    this_leaps = Math.floor(this.year / 4) - Math.floor(this.year / 100)
      + Math.floor(this.year / 400);
    if (this.isLeapYear && this.month <= 2)
      this_leaps -= 1;
    return this_leaps - other_leaps;
  }

  gregorian.localized = {};

  gregorian.prototype.dayOfWeekName = function() {
    return gregorian.localized.dayOfWeekNames[this.dayOfWeek-1];
  };

  gregorian.prototype.monthName = function() {
    return gregorian.localized.monthNames[this.month-1];
  };

  gregorian.prototype.toString = function() {
    return this.year + '-'
      + (this.month >= 10 ? this.month : '0' + this.month) + '-'
      + (this.dayOfMonth >= 10 ? this.dayOfMonth : '0' + this.dayOfMonth);
  };

  // Class methods:

  gregorian.from_Date = function (system) {
    return new daycount.counts.gregorian({
      year: system.getFullYear(),
      month: system.getMonth() + 1,
      dayOfMonth: system.getDate(),
    });
  };

  gregorian.from_localJulianDay = function (localJulianDay) {
    // See Wikipedia's Julian_day#Gregorian_calendar_from_Julian_day_number
    var J = localJulianDay.number + 0.5;
    var j = J + 32044;
    var g = Math.floor(j / 146097);
    var dg = Math.floor(j) % 146097;
    var c = Math.floor((Math.floor(dg / 36524) + 1) * 3 / 4);
    var dc = dg - c * 36524;
    var b = Math.floor(dc / 1461);
    var db = dc % 1461;
    var a = Math.floor((Math.floor(db / 365) + 1) * 3 / 4);
    var da = db - a * 365;
    var y = g * 400 + c * 100 + b * 4 + a;
    var m = Math.floor((Math.floor(da * 5) + 308) / 153) - 2;
    var d = da - Math.floor((m + 4) * 153 / 5) + 122;
    var Y = y - 4800 + Math.floor((m + 2) / 12);
    var M = (m + 2) % 12 + 1;
    var D = d + 1;
    return new daycount.counts.gregorian({
      year: Y, month: M, dayOfMonth: D,
    });
  };

  gregorian.from_String = function (string) {
    var match = (/(-?\d+)-(\d\d)-(\d\d)/).exec(string);
    if (!match) return null;
    var month = match[2][0] == '0' ? match[2][1] : match[2];
    var dayOfMonth = match[3][0] == '0' ? match[3][1] : match[3];
    return new daycount.counts.gregorian({
      year: parseInt(match[1]),
      month: parseInt(month),
      dayOfMonth: parseInt(dayOfMonth),
    });
  };

  return gregorian;
})();
daycount.counts.gregorian.localized.dayOfWeekNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
  "Saturday"
];

daycount.counts.gregorian.localized.monthNames = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"
];
daycount.counts.julianDay = (function() {

  function julianDay(arg) {
    if(typeof(arg) == 'object') arg = arg.number;
    this.number = parseInt(arg);
  };

  julianDay.prototype.toString = function() {
    return this.number.toString();
  };

  julianDay.from_Date = function(system) {
    // from Wikipedia's Julian_day article:
    var a = parseInt((13 - system.getUTCMonth()) / 12);
    var y = system.getUTCFullYear() + 4800 - a;
    var m = system.getUTCMonth() + (12 * a) - 2;
    var number = system.getUTCDate() + Math.floor((153 * m + 2) / 5)
             + 365 * y + Math.floor(y / 4) - Math.floor(y / 100)
             + Math.floor(y / 400) - 32045;
    return new daycount.counts.julianDay({
      number: number,
    });
  };

  return julianDay;
})();
daycount.counts.localJulianDay = (function() {

  function localJulianDay(arg) {
    if(typeof(arg) == 'object') arg = parseInt(arg && arg.number);
    this.number = parseInt(arg);
  };

  localJulianDay.prototype.plus = function(days) {
    return new daycount.counts.localJulianDay(this.number + days);
  };

  localJulianDay.prototype.toString = function() {
    return this.number.toString();
  };

  // Conversions.  Local Julian Day is the most normalized count, being just
  // one integer to uniquely represent any day.  So it makes sense to convert
  // between most counts via this one.

  localJulianDay.from_Date = function(system) {
    // from Wikipedia's Julian_day article:
    var a = parseInt((13 - system.getMonth()) / 12);
    var y = system.getFullYear() + 4800 - a;
    var m = system.getMonth() + (12 * a) - 2;
    var number = system.getDate() + Math.floor((153 * m + 2) / 5)
             + 365 * y + Math.floor(y / 4) - Math.floor(y / 100)
             + Math.floor(y / 400) - 32045;
    return new daycount.counts.localJulianDay({
      number: number,
    });
  };

  localJulianDay.from_gregorian = function(gregorian) {
    // from Wikipedia's Julian_day article:
    var a = parseInt((14 - gregorian.month) / 12);
    var y = gregorian.year + 4800 - a;
    var m = gregorian.month + (12 * a) - 3;
    var number = gregorian.dayOfMonth + Math.floor((153 * m + 2) / 5)
             + 365 * y + Math.floor(y / 4) - Math.floor(y / 100)
             + Math.floor(y / 400) - 32045;
    return new daycount.counts.localJulianDay({
      number: number,
    });
  };

  localJulianDay.from_long = function(long) {
    var number = 584283 + long.kin + 20 * long.winal + 360 * long.tun
      + 7200 * long.katun + 144000 * long.baktun;
    return new daycount.counts.localJulianDay(number);
  };

  localJulianDay.from_venus = function(venus) {
    var year0 = venus.year > 0 ? venus.year - 1 : venus.year;
    var offset = year0 * 224
      + Math.floor(year0 / 10) * 7
      + venus.dayOfYear - 1;
    return new daycount.counts.localJulianDay(2453951 + offset);
  };

  localJulianDay.from_mars = function(mars) {
    var offset = (mars.year > 0 ? mars.year - 1 : mars.year) * 687 + mars.dayOfYear - 1;
    return new daycount.counts.localJulianDay(2453690 + offset);
  };

  localJulianDay.from_thoth = function(thoth) {
    var offset = (thoth.year > 0 ? thoth.year - 1 : thoth.year) * 88 + thoth.dayOfYear - 1;
    return new daycount.counts.localJulianDay(2452993 + offset);
  };

  localJulianDay.from_String = function(string) {
    var match = (/[Ll][Jj][Dd]:(\d+)/).exec(string);
    if (!match) return null;
    return new daycount.counts.localJulianDay(parseInt(match[1]));
  };

  return localJulianDay;
})();
daycount.counts.long = (function() {

  var start_jd = 584283;

  function long(arg) {
    this.baktun = parseInt(arg && arg.baktun);
    this.katun = parseInt(arg && arg.katun);
    this.tun = parseInt(arg && arg.tun);
    this.winal = parseInt(arg && arg.winal);
    this.kin = parseInt(arg && arg.kin);
  };

  long.prototype.toString = function() {
    return this.baktun + '.' + this.katun + '.' + this.tun +
      '.' + this.winal + '.' + this.kin;
  };

  long.pattern = /(\d+)\.(\d+)\.(\d+)\.(\d+)\.(\d+)/;

  long.from_localJulianDay = function(localJulianDay) {
    var days = localJulianDay.number - start_jd;
    var kin = days % 20;
    var winal = Math.floor(((days - kin) % 360) / 20);
    var tun = Math.floor(((days - kin - winal * 20) % 7200) / 360);
    var katun = Math.floor(
      ((days - kin - winal * 20 - tun * 360) % 144000) / 7200);
    var baktun = Math.floor(
      ((days - kin - winal * 20 - tun * 360 - katun * 7200) % (20 * 144000))
      / 144000);
    return new daycount.counts.long({
      baktun: baktun,
      katun: katun,
      tun: tun,
      winal: winal,
      kin: kin,
    });
  };

  long.from_String = function(string) {
    var match = (long.pattern).exec(string);
    if (!match) return null;
    return new daycount.counts.long({
      baktun: parseInt(match[1]),
      katun: parseInt(match[2]),
      tun: parseInt(match[3]),
      winal: parseInt(match[4]),
      kin: parseInt(match[5]),
    });
  };

  return long;
})();
daycount.counts.mars = (function() {

  var start_jd = 2453690;

  function mars(arg) {
    this.year = parseInt(arg && arg.year);
    this.dayOfYear = parseInt(arg && arg.dayOfYear);
    this.ascent = this.dayOfYear <= 300 ? this.dayOfYear : NaN;
    this.firstfour = 300 < this.dayOfYear && this.dayOfYear <= 340
      ? this.dayOfYear - 300 : NaN;
    this.firstthree = 340 < this.dayOfYear && this.dayOfYear <= 343
      ? this.dayOfYear - 340 : NaN;
    this.one = 343 < this.dayOfYear && this.dayOfYear <= 344
      ? this.dayOfYear - 343 : NaN;
    this.secondthree = 344 < this.dayOfYear && this.dayOfYear <= 347
      ? this.dayOfYear - 344 : NaN;
    this.secondfour = 347 < this.dayOfYear && this.dayOfYear <= 387
      ? this.dayOfYear - 347 : NaN;
    this.descent = 387 < this.dayOfYear ? this.dayOfYear - 387 : NaN;
  };

  mars.from_localJulianDay = function(localJulianDay) {
    var fixed = localJulianDay.number - start_jd;
    var year0 = Math.floor(fixed / 687);
    var dayOfYear = fixed - (year0 * 687) + 1;
    var year = (year0 >= 0) ? year0 + 1 : year0;
    return new daycount.counts.mars({
      year: year,
      dayOfYear: dayOfYear,
    });
  };

  mars.pattern = /[Mm][Cc]:?(-?[1-9]\d*)\/(\d+)/;

  mars.from_String = function(string) {
    var match = mars.pattern.exec(string);
    if (!match) return null;
    var year = parseInt(match[1]);
    var dayOfYear = parseInt(match[2]);
    return new mars({year:year,dayOfYear:dayOfYear});
  };

  mars.prototype.toString = function() {
    return 'MC:' + (this.year || 'x') + '/' + this.dayOfYear +
      ' (' + (this.year || 'x') + ':' +
         (this.ascent ? this.ascent : 'x/' +
          (this.firstfour ? this.firstfour : 'x/' +
           (this.firstthree ? this.firstthree : 'x/' +
            (this.one ? this.one : 'x/' +
             (this.secondthree ? this.secondthree : 'x/' +
              (this.secondfour ? this.secondfour : 'x/' +
               this.descent)))))) + ')';
  }

  return mars;
})();
daycount.counts.thoth = (function() {

  var start_jd = 2452993;

  function thoth(arg) {
    this.year = parseInt(arg && arg.year);
    this.dayOfYear = parseInt(arg && arg.dayOfYear);
  };

  thoth.from_localJulianDay = function(localJulianDay) {
    var fixed = localJulianDay.number - start_jd;
    var year0 = Math.floor(fixed / 88);
    var dayOfYear = fixed - (year0 * 88) + 1;
    var year = (year0 >= 0) ? year0 + 1 : year0;
    return new daycount.counts.thoth({
      year: year,
      dayOfYear: dayOfYear,
    });
  };

  thoth.pattern = /[Tt][Cc]:?(-?[1-9]\d*)\/(\d+)/;

  thoth.from_String = function(string) {
    var match = thoth.pattern.exec(string);
    if (!match) return null;
    var year = parseInt(match[1]);
    var dayOfYear = parseInt(match[2]);
    return new thoth({year:year,dayOfYear:dayOfYear});
  };

  thoth.prototype.toString = function() {
    return 'TC:' + this.year + '/' + this.dayOfYear;
  }

  return thoth;
})();
daycount.counts.venus = (function() {

  var start_jd = 2453951;

  function venus(arg) {
    this.year = parseInt(arg && arg.year);
    this.yearOfDecade = (this.year > 0) ? (this.year - 1) % 10 + 1 : this.year % 10 + 11;
    this.dayOfYear = parseInt(arg && arg.dayOfYear);
    this.month = Math.floor((this.dayOfYear - 1) / 28) + 1;
    this.dayOfMonth = (this.dayOfYear - 1) % 28 + 1;
    this.week = (this.year ? Math.floor((this.dayOfYear - 1) / 7) + 1 : NaN);
    this.dayOfWeek = (this.dayOfYear - 1) % 7 + 1;
  };

  venus.from_localJulianDay = function(localJulianDay) {
    var fixed = localJulianDay.number - start_jd;
    var decade0 = Math.floor(fixed / 2247);
    var dayOfDecade = fixed - (decade0 * 2247);
    var yearOfDecade = Math.floor(dayOfDecade / 224) + 1;
    var dayOfYear = dayOfDecade % 224 + 1;
    if (yearOfDecade == 11) { yearOfDecade -= 1; dayOfYear += 224; }
    var year = decade0 * 10 + yearOfDecade - 1;
    if (year >= 0) year += 1;
    return new daycount.counts.venus({
      year: year,
      dayOfYear: dayOfYear,
    });
  };

  venus.pattern = /[Vv][Cc]:?(-?[1-9]\d*)\/(\d+)(\+[1-7])?/;

  venus.from_String = function(string) {
    var match = venus.pattern.exec(string);
    if (!match) return null;
    var year = parseInt(match[1]);
    var dayOfYear = parseInt(match[2]) + (match[3] ? parseInt(match[3]) : 0);
    return new venus({year:year,dayOfYear:dayOfYear});
  };

  venus.prototype.toString = function() {
    return 'VC:' + (this.year || 'x') + '/'
      + (this.dayOfYear <= 224 ? this.dayOfYear : '224+' + this.dayOfWeek)
      + ' (' + (this.dayOfYear <= 224
        ? (this.yearOfDecade + ',' + (this.week || 'x') + ',' + this.dayOfWeek)
        : ('\u221E,' + this.dayOfWeek))
      + ')';
  }

  return venus;
})();var rulers = [];

function updateRulers(){
    for (var i in rulers ) {
        var ruler = rulers[i];
        ruler.update();
    }
}

var Ruler = function( p1, p2 ){
	var ruler = new THREE.Object3D();

	ruler.p1 = p1;
	ruler.p2 = p2;

	var offset = 5,
		p1vec1 = new THREE.Vector3(),
		p1vec2 = new THREE.Vector3(),
		p2vec1 = new THREE.Vector3(),
		p2vec2 = new THREE.Vector3();

	if ( ruler.p1.scale.y > ruler.p2.scale.y ){
		p1vec2.y = ruler.p1.scale.y + offset;
		p2vec2.y = ruler.p1.scale.y + offset;
	}else{
		p1vec2.y = ruler.p2.scale.y + offset;
		p2vec2.y = ruler.p2.scale.y + offset;
	}

	var p1Geo = new THREE.Geometry();
	var p2Geo = new THREE.Geometry();
	var rulerGeo = new THREE.Geometry();

	p1Geo.vertices.push( p1vec1 );
	p1Geo.vertices.push( p1vec2 );

	p2Geo.vertices.push( p2vec1 );
	p2Geo.vertices.push( p2vec2 );

	rulerGeo.vertices.push( p1vec2 );
	rulerGeo.vertices.push( p2vec2 );

	material = new THREE.LineBasicMaterial( { color: 0x2BBFBD, opacity: 0.25, linewidth: 1 } );

	ruler.p1Line = new THREE.Line( p1Geo, new THREE.LineBasicMaterial( { color: 0x2BBFBD, opacity: 0.25, linewidth: 1 } ) );
	ruler.p2Line = new THREE.Line( p2Geo, new THREE.LineBasicMaterial( { color: 0x2BBFBD, opacity: 0.25, linewidth: 1 } ) );
	ruler.rulerLine = new THREE.Line( rulerGeo, new THREE.LineBasicMaterial( { color: 0x2BBFBD, opacity: 0.25, linewidth: 1 } ) );

	ruler.add( ruler.p1Line );
	ruler.add( ruler.p2Line );
	ruler.add( ruler.rulerLine );

	ruler.update = function(){

		this.rulerLine.geometry.verticesNeedUpdate = true;
		this.p1.updateMatrixWorld();
		this.p2.updateMatrixWorld();

		var p1Vec = this.p1Line.geometry.vertices[1].clone();
		p1Vec.applyMatrix4( this.p1Line.matrixWorld );

		var p2Vec = this.p2Line.geometry.vertices[1].clone();
		p2Vec.applyMatrix4( this.p2Line.matrixWorld );

		this.rulerLine.geometry.vertices[0] = p1Vec;
		this.rulerLine.geometry.vertices[1] = p2Vec;

		this.p1Line.position = this.p1.position;
		this.p2Line.position = this.p2.position;

		var mid = vec3Mid( this.p1.position.clone(), this.p2.position.clone() );
		var p1LineMid = lineMid( this.p1Line );
	};

	rulers.push( ruler );
	return ruler;
};

var shaderList = ['shaders/lavashader'];

function loadShaders(list, callback) {
    var shaders = {};
    var expectedFiles = list.length * 2;
    var loadedFiles = 0;

    function makeCallback(name, type) {
        return function (data) {
            if (shaders[name] === undefined) {
                shaders[name] = {};
            }
            shaders[name][type] = data;
            loadedFiles++;
            if (loadedFiles == expectedFiles) {
                callback(shaders);
            }
        };
    }
    for (var i = 0; i < list.length; i++) {
        var vertexShaderFile = list[i] + '.vsh';
        var fragmentShaderFile = list[i] + '.fsh';
        var splitted = list[i].split('/');
        var shaderName = splitted[splitted.length - 1];
        $(document)
            .load(vertexShaderFile, makeCallback(shaderName, 'vertex'));
        $(document)
            .load(fragmentShaderFile, makeCallback(shaderName, 'fragment'));
    }
}
// 		JDCT    Epoch Julian Date, Coordinate Time
//       EC     Eccentricity, e
//       QR     Periapsis distance, q (AU)
//       IN     Inclination w.r.t xy-plane, i (degrees)
//       OM     Longitude of Ascending Node, OMEGA, (degrees)
//       W      Argument of Perifocus, w (degrees)
//       Tp     Time of periapsis (Julian day number)
//       N      Mean motion, n (degrees/day)
//       MA     Mean anomaly, M (degrees)
//       TA     True anomaly, nu (degrees)
//       A      Semi-major axis, a (AU)
//       AD     Apoapsis distance (AU)
//       PR     Sidereal orbit period (day)
var planet_init_list = [
	{ planetName:"Sol", color:0xfff5ec, width: 50, planetOrder:0, satelliteOf:"-1", scale_mult:"1 1 1", orbit_calc_method:"star", dist_from_parent:0, orbit_sidereal_in_days:0, diameter_km:1392000, diameter_sqrtln:7.072, obliquity:0, rotation_sidereal_in_days:0, a_semimajor_axis:0, e_eccentricity:0, i_inclination:0, O_perihelion:0, w_ecliptic_long:0, L_mean_anomaly:0, a_per_cy:0, e_per_cy:0, i_per_cy:0, O_per_cy:0, w_per_cy:0, L_per_cy:0},
	{ planetName:"Mercury", color:0xf37e1a, width: 10, planetOrder:1, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:57900000, orbit_sidereal_in_days:88, rotation_sidereal_in_days:58.6467, diameter_km:4879, diameter_sqrtln:4.246, obliquity:0.01,  a_semimajor_axis:0.38709893, e_eccentricity:0.20563069, i_inclination:7.00487, O_ecliptic_long:48.33167, w_perihelion:77.45645, L_mean_longitude:252.25084, a_per_cy:0.00000066, e_per_cy:0.00002527, i_per_cy:-23.51, O_per_cy:-446.30, w_per_cy:573.57, L_per_cy:538101628.29},
	{ planetName:"Venus", color:0xe07749, width: 10, planetOrder:2, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:108200000, orbit_sidereal_in_days:225, rotation_sidereal_in_days:-243.02, diameter_km:12104, diameter_sqrtln:4.701, obliquity:177.4, a_semimajor_axis:0.72333199, e_eccentricity:0.00677323, i_inclination:3.39471, O_ecliptic_long:76.68069, w_perihelion:131.53298, L_mean_longitude:181.97973, a_per_cy:0.00000092, e_per_cy:-0.00004938, i_per_cy:-2.86, O_per_cy:-996.89, w_per_cy:-108.80, L_per_cy:210664136.06},
	{ planetName:"Earth",
		color: 0x345374,
		width: 10,
		planetOrder: 3,
		satelliteOf: "Sol",
		scale_mult: "1 1 1",
		orbit_calc_method: "major_planet",
		dist_from_parent: 149600000,
		orbit_sidereal_in_days: 365.26,
		rotation_sidereal_in_days: 1,
		diameter_km: 12756,
		diameter_sqrtln: 4.727,
		obliquity: 23.439,
		a_semimajor_axis: 1.00000011,
		e_eccentricity: 0.01671022,
		i_inclination: 0.00005,
		O_ecliptic_long: -11.26064,
		w_perihelion: 102.94719,
		L_mean_longitude: 100.46435,
		a_per_cy: -0.00000005,
		e_per_cy: -0.00003804,
		i_per_cy: -46.94,
		O_per_cy: -18228.25,
		w_per_cy: 1198.28,
		L_per_cy: 129597740.63
	},
	{ planetName:"Mars", color:0xae763e, width: 10, planetOrder:4, satelliteOf:"Sol", scale_mult:"1 1 1",orbit_calc_method:"major_planet", dist_from_parent:227900000, orbit_sidereal_in_days:693.99, rotation_sidereal_in_days:24.62326, diameter_km:6794, diameter_sqrtln:4.412, obliquity:1.5424, a_semimajor_axis:1.52366231, e_eccentricity:0.09341233, i_inclination:1.85061, O_ecliptic_long:49.57854, w_perihelion:336.04084, L_mean_longitude:355.45332, a_per_cy:-0.00007221, e_per_cy:0.00011902, i_per_cy:-25.47, O_per_cy:-1020.19, w_per_cy:1560.78, L_per_cy:68905103.78},
	{ planetName:"Jupiter", color:0xf28951, width: 10, planetOrder:5, satelliteOf:"Sol", scale_mult:"1 1 0.92", orbit_calc_method:"major_planet", dist_from_parent:778400000, orbit_sidereal_in_days:4346.59, rotation_sidereal_in_days:0.38451, diameter_km:142984, diameter_sqrtln:5.935, obliquity:3.13, a_semimajor_axis:5.20336301, e_eccentricity:0.04839266, i_inclination:1.30530, O_ecliptic_long:100.55615, w_perihelion:14.75385, L_mean_longitude:34.40438, a_per_cy:0.00060737, e_per_cy:-0.00012880, i_per_cy:-4.15, O_per_cy:1217.17, w_per_cy:839.93, L_per_cy:10925078.35},
	{ planetName:"Saturn", color:0xdeb078, width: 10, planetOrder:6, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:1400000000, orbit_sidereal_in_days:10775.17, rotation_sidereal_in_days:0.43929, diameter_km:120536, diameter_sqrtln:5.85, obliquity:26.73, a_semimajor_axis:9.53707032, e_eccentricity:0.05415060, i_inclination:2.48446, O_ecliptic_long:113.71504, w_perihelion:92.43194, L_mean_longitude:49.94432, a_per_cy:-0.00301530, e_per_cy:-0.00036762, i_per_cy:6.11, O_per_cy:-1591.05, w_per_cy:-1948.89, L_per_cy:4401052.95},
	{ planetName:"Uranus", color:0x9cb8c3, width: 10, planetOrder:7, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:2870000000, orbit_sidereal_in_days:30681.84, rotation_sidereal_in_days:-0.7183333, diameter_km:51118, diameter_sqrtln:5.421, obliquity:97.77, a_semimajor_axis:19.19126393, e_eccentricity:0.04716771, i_inclination:0.76986, O_ecliptic_long:74.22988, w_perihelion:170.96424, L_mean_longitude:313.23218, a_per_cy:0.00152025, e_per_cy:-0.00019150, i_per_cy:-2.09, O_per_cy:-1681.40, w_per_cy:1312.56, L_per_cy:1542547.79},
	{ planetName:"Neptune", color:0x6086e5, width: 10, planetOrder:8, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:4500000000, orbit_sidereal_in_days:60194.85, rotation_sidereal_in_days:0.67125, diameter_km:49528, diameter_sqrtln:5.405, obliquity:28.32, a_semimajor_axis:30.06896348, e_eccentricity:0.00858587, i_inclination:1.76917, O_ecliptic_long:131.72169, w_perihelion:44.97135, L_mean_longitude:304.88003, a_per_cy:-0.00125196, e_per_cy:0.00002510, i_per_cy:-3.64, O_per_cy:-151.25, w_per_cy:-844.43, L_per_cy:786449.21},
	{ planetName:"Pluto", color:0x9fa9b2, width: 10, planetOrder:9, satelliteOf:"Sol", scale_mult:"1 1 1", orbit_calc_method:"major_planet", dist_from_parent:5900000000, orbit_sidereal_in_days:90767.11, rotation_sidereal_in_days:-0.2564537, diameter_km:2302, diameter_sqrtln:3.871, obliquity:119.61, a_semimajor_axis:39.48168677, e_eccentricity:0.24880766, i_inclination:17.14175, O_ecliptic_long:110.30347, w_perihelion:224.06676, L_mean_longitude:238.92881, a_per_cy:-0.00076912, e_per_cy:0.00006465, i_per_cy:11.07, O_per_cy:-37.33, w_per_cy:-132.25, L_per_cy:522747.90},

	{ planetName:"Luna", color:0xa6a6a6, width: 10, planetOrder:1, satelliteOf:"Earth", shapeName:"art/shapes/planets/luna.dts", scale_mult:"1 1 1", orbit_calc_method:"luna", orbit_sidereal_in_days:27.39677, rotation_sidereal_in_days:1.13841, diameter_km:3476, obliquity:6.68, DB:"PlanetDBLuna", N_long_asc:125.1228, i_inclination:5.1454, w_arg_perigee:318.0634, a_mean_dist:0.00384399, e_eccentricity:0.054900, M_mean_anomaly:115.3654, N_per_cy:-0.0529538083, w_per_cy:0.1643573223, m_per_cy:13.0649929509 }
];

var ephemeris = [
	{
		name: 'Sun',
		texture: './images/solarsystem/sunmap.jpg',
		size: 1392684
	},{
		name: 'Mercury',
		texture: './images/solarsystem/mercurymap.jpg',
		size: 2439.7,
		period: 87.96926,
		a: [ 0.38709843, 0.00000000 ],
		e: [ 0.20563593, 0.00002123 ],
		I: [ 7.00559432, -0.00590158 ],
		L: [ 252.25166724, 149472.67486623 ],
		wBar: [ 77.45771895, 0.15940013 ],
		om: [ 48.33961819, -0.12214182 ],
		aphelion: 69817445
	},{
		name: 'Venus',
		texture: './images/solarsystem/venusmap.jpg',
		size: 6051.8,
		period: 224.7008,
		a: [ 0.72332102, -0.00000026 ],
		e: [ 0.00676399, -0.00005107 ],
		I: [ 3.39777545, 0.00043494 ],
		L: [ 181.97970850, 58517.81560260 ],
		wBar: [ 131.76755713, 0.05679648 ],
		om: [ 76.67261496,-0.27274174 ],
		aphelion: 108942780
	},{
		name: 'Earth',
		texture: './images/solarsystem/earthmap2.jpg',
		size: 6371.00,
		period: 365.25636,
		a: [ 1.00000018, -0.00000003 ],
		e: [ 0.01673163, -0.00003661 ],
		I: [ -0.00054346, -0.01337178 ],
		L: [ 100.46691572, 35999.37306329 ],
		wBar: [ 102.93005885, 0.31795260 ],
		om: [ -5.11260389, -0.24123856 ],
		aphelion: 152098233
	},{
		name: 'Mars',
		texture: './images/solarsystem/marsmap.jpg',
		size: 3389.5,
		period: 686.97959,
		a: [ 1.52371243, 0.00000097 ],
		e: [ 0.09336511, 0.00009149 ],
		I: [ 1.85181869, -0.00724757  ],
		L: [ -4.56813164, 19140.29934243 ],
		wBar: [ -23.91744784, 0.45223625 ],
		om: [ 49.71320984, -0.26852431 ],
		aphelion: 249232432
	},{
		name: 'Jupiter',
		texture: './images/solarsystem/jupitermap.jpg',
		size: 69911,
		period: 4332.8201,
		a: [ 5.20248019, -0.00002864 ],
		e: [ 0.04853590,  0.00018026 ],
		I: [ 1.29861416, -0.00322699  ],
		L: [ -34.33479152,  3034.90371757 ],
		wBar: [ 14.27495244, 0.18199196 ],
		om: [ 100.29282654, 0.13024619 ],
		aphelion: 816001807
	},{
		name: 'Saturn',
		texture: './images/solarsystem/saturnmap.jpg',
		size: 58232,
		period: 10755.699,
		a: [ 9.54149883, -0.00003065 ],
		e: [ 0.05550825, -0.00032044 ],
		I: [ 2.49424102, 0.00451969  ],
		L: [ 50.07571329, 1222.11494724 ],
		wBar: [ 92.86136063, 0.54179478 ],
		om: [ 113.63998702, -0.25015002 ],
		aphelion: 1503509229
	},{
		name: 'Uranus',
		texture: './images/solarsystem/uranusmap.jpg',
		size: 30687.153,
		period: 30700,
		a: [ 19.18797948, -0.00020455 ],
		e: [ 0.04685740, -0.00001550 ],
		I: [ 0.77298127, -0.00180155  ],
		L: [ 314.20276625, 428.49512595 ],
		wBar: [ 172.43404441, 0.09266985 ],
		om: [ 73.96250215, 0.05739699 ],
		aphelion: 3006318143
	},{
		name: 'Neptune',
		texture: './images/solarsystem/neptunemap.jpg',
		size: 24622,
		period: 60190.03,
		a: [ 30.06952752, 0.00006447 ],
		e: [ 0.00895439, 0.00000818 ],
		I: [ 1.77005520, 0.00022400  ],
		L: [ 304.22289287, 218.46515314 ],
		wBar: [ 46.68158724, 0.01009938 ],
		om: [ 131.78635853, -0.00606302  ],
		aphelion: 4537039826
	}
]

function updateLabels(){
    for (var i in ss) {
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
var textureFlare0 = THREE.ImageUtils.loadTexture("./images/lensflare/lensflare0.png");
var textureFlare1 = THREE.ImageUtils.loadTexture("./images/lensflare/lensflare1.png");
var textureFlare2 = THREE.ImageUtils.loadTexture("./images/lensflare/lensflare2.png");
var textureFlare3 = THREE.ImageUtils.loadTexture("./images/lensflare/lensflare3.png");

function addLensFlare( x, y, z, size, overrideImage ){

    var flareColor = new THREE.Color( 0xffffff );
    THREE.ColorUtils.adjustHSV(flareColor, 0.08, 0.5, 0.5);

    lensFlare = new THREE.LensFlare(overrideImage ? overrideImage : textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);

    var textureFlare0 = THREE.ImageUtils.loadTexture( "./images/lensflare/lensflare0.png" );
    var textureFlare2 = THREE.ImageUtils.loadTexture( "./images/lensflare/lensflare2.png" );
    var textureFlare3 = THREE.ImageUtils.loadTexture( "./images/lensflare/lensflare3.png" );

    lensFlare.add( textureFlare0, 1000, 0.0, THREE.AdditiveBlending );
    lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
    lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
    lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

    lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
    lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
    lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
    lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

    lensFlare.customUpdateCallback = lensFlareUpdateCallback;

    lensFlare.position = new THREE.Vector3(x,y,z);
    lensFlare.size = size ? size : 16000 ;
    return lensFlare;

}

function lensFlareUpdateCallback( object ) {
    var f, fl = this.lensFlares.length;
    var flare;
    var vecX = -this.positionScreen.x * 2;
    var vecY = -this.positionScreen.y * 2;
    var size = object.size ? object.size : 1000;
    var camDistance = camera.position.length();

    for (f = 0; f < fl; f++) {
        flare = this.lensFlares[f];
        flare.x = this.positionScreen.x + vecX * flare.distance;
        flare.y = this.positionScreen.y + vecY * flare.distance;
        flare.scale = size / camDistance;
        flare.rotation = 0;
        flare.opacity = 1.0 - heatVisionValue;
    }
}var Orbit = function( e, material ){

	var LOD,
		axisRez = 40,
		eph = e;

	var axisPoints = [];
	var spline = [];

	for( var i = 0; i < axisRez; i++ ) {
		x = ( eph.A * Math.cos( i / axisRez * Math.PI * 2 ) + ( eph.aphelion - eph.A ) );
		z = ( eph.semiMinor * Math.sin( i / axisRez * Math.PI * 2 ) );
		axisPoints[i] = new THREE.Vector3( x, 0, z );
	}

	spline =  new THREE.ClosedSplineCurve3( axisPoints );
	var splineGeo = new THREE.Geometry();
	var splinePoints = spline.getPoints( axisRez );

	for(var i = 0; i < splinePoints.length; i++){
		splineGeo.vertices.push(splinePoints[i]);
	}

	LOD = new THREE.Line( splineGeo, material );

 return LOD;
};var Planet = function( material, i ){

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
var uniforms = {

	time: { type: "f", value: 1.0 },
	resolution: { type: "v2", value: new THREE.Vector2() },

	fogDensity: { type: "f", value: 0 },
	fogColor: { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },

	texture1: { type: "t", value: THREE.ImageUtils.loadTexture( "./images/lava/cloud.png" ) },
	texture2: { type: "t", value: THREE.ImageUtils.loadTexture( "./images/lava/lavatile.jpg" ) },

	uvScale: { type: "v2", value: new THREE.Vector2( 1, 1 ) }

};


var Sun = function(){

	uniforms.texture1.value.wrapS = uniforms.texture1.value.wrapT = THREE.MirroredRepeatWrapping;
	uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT = THREE.MirroredRepeatWrapping;

	var sunMaterial = new THREE.ShaderMaterial( {

		uniforms: uniforms,
		vertexShader: shaderList.lavashader.vertex,
		fragmentShader: shaderList.lavashader.fragment

	} );

	// var sunMaterial = new THREE.MeshLambertMaterial( {
	// 	map: THREE.ImageUtils.loadTexture( './models/solarsystem/sunmap.jpg' ),
	// 	overdraw: true
	// });

	var sun = new Planet( sunMaterial );
	sun.name = "The Sun";

	/********************************
	LENS FLARE
	********************************/
	return sun;
}
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

	ss[0].label = new Label( ss[0], 1, $container );

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
};var camPosition = function( position, target, time ){
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
}var WIDTH = $(window).width(),
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
	controls.addEventListener( 'change', render );

	setupScene();

	camOne = new camPosition( { x: 0, y: 50, z: 500 }, { x: 0, y: 0, z: 0 }, 1500 );
	camTwo = new camPosition( { x: 0, y: 12000, z: 500 }, { x: 0, y: 0, z: 0 }, 5000 );
	camThree = new camPosition( { x: -500, y: 250, z: -1000 }, { x: 0, y: 0, z: 0 }, 3000 );
	camEarth = new camPosition( { x: 50, y: 50, z: 250 }, ss[3].position, 1500 );
	camMars = new camPosition( { x: 75, y: 50, z: 300 }, ss[4].position, 1500 );

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

	var camFolder = gui.addFolder( 'Camera Positions' );
	camFolder.open();
	camFolder.add( camOne, 'tween' ).name( 'Camera Home' );
	camFolder.add( camTwo, 'tween' ).name( 'Camera Two' );
	camFolder.add( camThree, 'tween' ).name( 'Camera Three' );
	camFolder.add( camEarth, 'tween' ).name( 'Camera Earth' );
	camFolder.add( camMars, 'tween' ).name( 'Camera Mars' );
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

	requestAnimationFrame( animate );

    camera.updateProjectionMatrix();
	camera.lookAt( camTarget );

	updateRulers();
    updateLabels();
	controls.update();
	stats.update();
	TWEEN.update();
	setSolarSystemScale();
	planetsOrbit( t.count );

	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera );

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects( solarSystem.children );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.label.show();
			// setLoadMessage('Awesome information about ' + INTERSECTED.name + ' could go here!');
			$( '#loadtext' ).fadeIn('fast');

		}

	} else {

		if ( INTERSECTED != null){
			showLabels( ss, false );
		}

		INTERSECTED = null;
		$( '#loadtext' ).fadeOut('fast');

	}

	var delta = clock.getDelta();
	var time = clock.getElapsedTime();

	uniforms.time.value = time + delta;
	t.count = t.count + 1 * t.multiplier;

	camera.lookAt( camTarget );
	render();
}

function render() {

	renderer.clear();
	renderer.render( scene, camera );

}var stars = function( systemSize, particleSize){

    var particles, geometry, material, i;
    geometry = new THREE.Geometry();

    for ( i = 0; i < 20000; i ++ ) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * systemSize - systemSize/2;
        vertex.y = Math.random() * systemSize - systemSize/2;
        vertex.z = Math.random() * systemSize - systemSize/2;

        geometry.vertices.push( vertex );

    }

    material =   new THREE.ParticleBasicMaterial({
        color: 0xFFFFFF,
        size: particleSize,
        map: THREE.ImageUtils.loadTexture( "images/star.png" ),
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    particles = new THREE.ParticleSystem( geometry, material );

    particles.rotation.x = Math.random() * 6;
    particles.rotation.y = Math.random() * 6;
    particles.rotation.z = Math.random() * 6;

    return particles;
}




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
	function addLensFlare( x, y, z, size, overrideImage ){

	var flareColor = new THREE.Color( 0xffffff );

	var lensFlare = new THREE.LensFlare( overrideImage, 700, 0.0, THREE.AdditiveBlending, flareColor );

	var textureFlare0 = THREE.ImageUtils.loadTexture( "./textures/lensflare/lensflare0.png" );
	var textureFlare2 = THREE.ImageUtils.loadTexture( "./textures/lensflare/lensflare2.png" );
	var textureFlare3 = THREE.ImageUtils.loadTexture( "./textures/lensflare/lensflare3.png" );

	lensFlare.add( textureFlare0, 200, 0.0, THREE.AdditiveBlending );
	lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
	lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
	lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

	lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
	lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
	lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
	lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

	lensFlare.customUpdateCallback = lensFlareUpdateCallback;

	lensFlare.position = new THREE.Vector3(x,y,z);
	lensFlare.size = size ? size : 16000 ;
	return lensFlare;

}

function lensFlareUpdateCallback( object ) {

	var f, fl = object.lensFlares.length;
	var flare;
	var vecX = -object.positionScreen.x * 2;
	var vecY = -object.positionScreen.y * 2;


	for( f = 0; f < fl; f++ ) {

	   flare = object.lensFlares[ f ];

	   flare.x = object.positionScreen.x + vecX * flare.distance;
	   flare.y = object.positionScreen.y + vecY * flare.distance;

	   flare.rotation = 0;

	}

	object.lensFlares[ 2 ].y += 0.025;
	object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
}
