import * as THREE from '../libs/three.js-r132/build/three.module.js';


document.addEventListener('DOMContentLoaded', () => {
  const initialize = async() => {
    const arButton = document.querySelector("#ar-button");
    const captureButton = document.querySelector("#capture-button");
    var imageElement = document.getElementById("captured-image");

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
    // preserveDrawingBuffer flag will help you to get the base64 encoding of the current frame The code for that will be something like this
    const loader = new THREE.TextureLoader();
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // create AR object
    const geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06); 
    // const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    const material =  new THREE.MeshBasicMaterial({
            map: loader.load('../cut_dog.jpg', undefined, undefined, function(err) {
                alert('Error');
            }),
        });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, -0.3);
    scene.add(cube);

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
      currentSession = await navigator.xr.requestSession('immersive-ar', {optionalFeatures: ['dom-overlay'],requiredFeatures: ["camera-access"],
       domOverlay: {root: document.body}});

      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType('local');
      await renderer.xr.setSession(currentSession);
      arButton.textContent = "End";

      animate();
  //     renderer.setAnimationLoop(() => {
	// renderer.render(scene, camera);
  //     });
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

    const save = async() => {
      console.log("activate save");
      var cap_img;
      cap_img = renderer.domElement.toDataURL();
      var cap_texture = new THREE.TextureLoader().load(cap_img);
      var cap_material = new THREE.MeshBasicMaterial( { map: cap_texture } );
      cube.material = cap_material
      // scene.add(cube);


      // imageElement.src = imgData;
      // var texture = new THREE.Texture( imageElement );
      // texture.needsUpdate = true;
      // var material = new THREE.MeshBasicMaterial( { map: texture } );
      // var mesh = new THREE.Mesh(new THREE.PlaneGeometry(imageElement.width, imageElement.height), material);
      // scene.add(mesh);
    }



    const add_cube = async() => {
      console.log("add cube");
      const add_geometry = new THREE.BoxGeometry(0.06, 0.06, 0.06); 
      const add_material = new THREE.MeshBasicMaterial({color: 0x00ff00});
      const add_mesh = new THREE.Mesh(add_geometry, add_material);
      add_mesh.position.set(0, 0, -0.3);
      scene.add(add_mesh);

    }
    function animate(){
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      renderer.setAnimationLoop(animate);
    };


    captureButton.addEventListener('click', () => {
      if (currentSession) {
        save();
        add_cube();
        console.log("clicked and saved");
      } else {
        console.log("error");
      }
    });
  }

  initialize();
});
