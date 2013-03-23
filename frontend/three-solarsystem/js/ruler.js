var rulers = [];

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

