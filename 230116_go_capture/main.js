import * as THREE from '../libs/three.js-r132/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
  const captureButton = document.querySelector("#capture-button");
  const info = document.querySelector("#info");
  var cup = document.querySelector("#cup");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial({color: 0x00ff00});




  const cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  const light = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(light);

  camera.position.z = 5;

  function animate() {
    requestAnimationFrame( animate );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
  }
  animate();

  captureButton.addEventListener('click', () => {
      console.log("clicked");
      var cap_img; 
      cap_img = renderer.domElement.toDataURL();
      //add an HTML element to the end of the body element of an HTML document
      cup.src = cap_img
      document.body.appendChild(renderer.domElement.toDataURL());
  });

});