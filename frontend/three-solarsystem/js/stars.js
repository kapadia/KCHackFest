var stars = function( systemSize, particleSize){
    
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


              
   