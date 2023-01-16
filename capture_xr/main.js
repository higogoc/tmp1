import * as THREE from '../../libs/three.js-r132/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
      // 캡쳐 버튼 추가 
  const captureButton = document.querySelector("#capture-button");
  const initialize = async() => {
    const arButton = document.querySelector("#ar-button");
    // check and request webxr session 
    const supported = navigator.xr && await navigator.xr.isSessionSupported('immersive-ar');
    if (!supported) {
      arButton.textContent = "Not Supported";
      arButton.disabled = true;
      return;
    }

    // build three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    // Set the size of the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Add the renderer to the HTML body
    document.body.appendChild(renderer.domElement);

    // create AR object
    const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06); 
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -0.3);
    scene.add(mesh);

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);


    renderer.xr.addEventListener("sessionstart", (e) => {
      console.log("session start");
    });
    renderer.xr.addEventListener("sessionend", () => {
      console.log("session end");
    });

    let currentSession = null;
    const start = async() => {
      currentSession = await navigator.xr.requestSession('immersive-ar', {optionalFeatures: ['dom-overlay'], domOverlay: {root: document.body}});

      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType('local');
      await renderer.xr.setSession(currentSession);
      arButton.textContent = "End";

      renderer.setAnimationLoop(() => {
    // Render the scene
    renderer.render(scene, camera);
    // 버튼 클릭 시 실행될 핸들러 함수 추가
    captureButton.addEventListener("click", captureHandler);
    // Capture the image
      var imageData = renderer.domElement.toDataURL();
      // Create an image element and set its source to the captured image
      var img = document.createElement('img');
      img.src = imageData;
      // Add the image to the HTML body
      document.body.appendChild(img);
      });
    }
    const end = async() => {
      currentSession.end();
      renderer.setAnimationLoop(null);
      renderer.clear();
      arButton.style.display = "none";
    }
    arButton.addEventListener('click', () => {
      if (currentSession) {
	end();
      } else {
	start();
      }
    });

    function captureHandler() {
      
      var imageData = renderer.domElement.toDataURL();
      var img = document.createElement('img');
      img.src = imageData;
      document.body.appendChild(img);
    }

  }

  initialize();
});
