import * as THREE from 'three';

import WebGPU from 'three/examples/jsm/capabilities/WebGPU.js'
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';

let camera : THREE.Camera;
let scene : THREE.Scene;
let renderer : WebGPURenderer;
let material : THREE.Material;


if ( WebGPU.isAvailable() === false ) {
    document.body.appendChild( WebGPU.getErrorMessage() );
    throw new Error( 'No WebGPU support' );
}

const container = document.createElement( 'div' );
document.body.appendChild( container );

camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
camera.position.set( 0, 200, 1200 );

scene = new THREE.Scene();

renderer = new WebGPURenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
 
camera.position.z = 5;

function animate() {
    requestAnimationFrame( animate );
    
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
}

animate();
console.log("22222");